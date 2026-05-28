import axios from "axios";
import asyncPool from "tiny-async-pool";
import moment from "moment";
import fs from "fs";
import axiosRetry from "axios-retry";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUZZLE_DIR = path.resolve(__dirname, "../puzzle");
const FIRST_PUZZLE_MONTH = moment("2007-04-01").startOf("month");
const CONCURRENT_REQUESTS = Number(process.env.CONCURRENT_REQUESTS || 10);

const forceAll = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");
const monthLimitArg = process.argv.find(
  (arg) => /^\d+$/.test(arg) && arg !== String(CONCURRENT_REQUESTS)
);
const monthLimit = monthLimitArg ? Number(monthLimitArg) : null;

axiosRetry(axios, {
  retries: 10,
  retryDelay: (retryCount) => retryCount * 10000,
  retryCondition: (error) => {
    if (error.response?.data?.message === "End date must be after start date") {
      return false;
    }
    return true;
  },
});

function monthKey(date) {
  return moment(date).format("YYYY-MM");
}

function monthFilePath(date) {
  const m = moment(date);
  return path.join(
    PUZZLE_DIR,
    m.format("YYYY"),
    `${m.format("YYYY-MM")}.json`
  );
}

function readMonthFile(date) {
  const filePath = monthFilePath(date);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function writeMonthFile(date, data) {
  const m = moment(date);
  const dir = path.join(PUZZLE_DIR, m.format("YYYY"));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(monthFilePath(date), JSON.stringify(data, null, 4));
}

function extractMainLine(rawInput) {
  return rawInput
    .replace(/\r?\n|\r/g, " ")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\$\d+/g, "")
    .replace(/\*/g, "")
    .replace(/(1-0|0-1|1\/2-1\/2)/g, "")
    .replace(/\d+\s*\.\.\./g, "")
    .replace(/\d+\s*\./g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function parsePgn(pgn) {
  const pos = pgn.lastIndexOf("]");
  const lines = pgn.split(/\r?\n/).filter((line) => line !== "");
  const raw = pgn.substring(pos + 1).trim();
  const moves = extractMainLine(raw);
  const data = { moves, raw };

  for (const line of lines) {
    const matches = line.match(/\[(.*)\s"(.*)"\]/i);
    if (matches) {
      data[matches[1].toLowerCase()] = matches[2];
    }
  }

  return data;
}

function puzzleDate(puzzle) {
  return puzzle.date?.slice(0, 10) ?? null;
}

function latestPuzzleDate(puzzles) {
  return puzzles.reduce((latest, puzzle) => {
    const date = puzzleDate(puzzle);
    if (!date) {
      return latest;
    }
    return !latest || date > latest ? date : latest;
  }, null);
}

function needsRecentMonthRefresh(monthDate, puzzles) {
  const month = moment(monthDate).startOf("month");
  const today = moment().startOf("day");
  const isCurrentMonth = month.isSame(today, "month");
  const isPreviousMonth = month.isSame(
    today.clone().subtract(1, "month"),
    "month"
  );

  // Only re-check recent months; older months are complete once saved.
  if (!isCurrentMonth && !isPreviousMonth) {
    return false;
  }

  const latest = latestPuzzleDate(puzzles);
  if (!latest) {
    return true;
  }

  if (isCurrentMonth) {
    return moment(latest).isBefore(today, "day");
  }

  const lastDayOfMonth = month.clone().endOf("month").format("YYYY-MM-DD");
  return latest < lastDayOfMonth;
}

function listMonthsFromToday(limit = null) {
  const months = [];
  let cursor = moment().startOf("month");

  while (cursor.isSameOrAfter(FIRST_PUZZLE_MONTH, "month")) {
    months.push(cursor.clone());
    cursor.subtract(1, "month");
    if (limit && months.length >= limit) {
      break;
    }
  }

  return months;
}

function scanExistingPuzzles(monthsToScan) {
  const existing = [];
  const missing = [];

  for (const monthDate of monthsToScan) {
    const key = monthKey(monthDate);
    const puzzles = readMonthFile(monthDate);

    if (!puzzles || puzzles.length === 0) {
      missing.push({ monthDate, key, reason: "no file or empty" });
      continue;
    }

    existing.push({ monthDate, key, count: puzzles.length });

    if (!forceAll && needsRecentMonthRefresh(monthDate, puzzles)) {
      missing.push({
        monthDate,
        key,
        reason: `out of date (latest: ${latestPuzzleDate(puzzles)})`,
      });
    }
  }

  return { existing, missing };
}

async function fetchMonth(date) {
  const monthEnd = moment(date).endOf("month");
  const thisMonth = moment().startOf("month").format("YYYY-MM-DD");
  const end = monthEnd.format("YYYY-MM-DD");
  let start = monthEnd.clone().startOf("month").format("YYYY-MM-DD");

  if (start === thisMonth) {
    start = monthEnd
      .clone()
      .startOf("month")
      .subtract(1, "day")
      .format("YYYY-MM-DD");
  }

  const url = `https://www.chess.com/callback/puzzles/daily?start=${start}&end=${end}`;

  try {
    const { data } = await axios.get(url);
    return data
      .filter((item) => item.date.includes(end.substring(0, 7)))
      .map((item) => {
        const parsed = parsePgn(item.pgn);
        const viewerUrl = parsed.fen
          ? `https://chess-board.fly.dev/?fen=${parsed.fen}`
          : null;
        return { ...item, parsed, viewerUrl };
      });
  } catch (error) {
    if (error.response?.data?.message === "End date must be after start date") {
      return [];
    }
    throw error;
  }
}

function mergeAllMonthlyFiles() {
  const allPuzzles = [];
  const seenIds = new Set();

  if (!fs.existsSync(PUZZLE_DIR)) {
    return [];
  }

  const yearDirs = fs
    .readdirSync(PUZZLE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (const year of yearDirs) {
    const monthFiles = fs
      .readdirSync(path.join(PUZZLE_DIR, year))
      .filter((name) => /^\d{4}-\d{2}\.json$/.test(name))
      .sort();

    for (const fileName of monthFiles) {
      const filePath = path.join(PUZZLE_DIR, year, fileName);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (!Array.isArray(data)) {
        continue;
      }

      for (const puzzle of data) {
        if (seenIds.has(puzzle.id)) {
          continue;
        }
        seenIds.add(puzzle.id);
        allPuzzles.push(puzzle);
      }
    }
  }

  return allPuzzles.sort((a, b) => a.id - b.id);
}

function writeCombinedFiles(puzzles) {
  fs.mkdirSync(PUZZLE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(PUZZLE_DIR, "all.json"),
    JSON.stringify(puzzles, null, 4)
  );
  fs.writeFileSync(
    path.join(PUZZLE_DIR, "all.txt"),
    puzzles
      .map((puzzle) => puzzle.parsed?.fen)
      .filter(Boolean)
      .join("\r\n")
  );
}

async function main() {
  const monthsToScan = listMonthsFromToday(monthLimit);
  const { existing, missing } = forceAll
    ? {
        existing: [],
        missing: monthsToScan.map((monthDate) => ({
          monthDate,
          key: monthKey(monthDate),
          reason: "forced re-fetch",
        })),
      }
    : scanExistingPuzzles(monthsToScan);

  console.log(`Puzzle directory: ${PUZZLE_DIR}`);
  console.log(`Scanning ${monthsToScan.length} month(s) from today back to 2007-04`);
  console.log(`Already have: ${existing.length} month file(s)`);
  console.log(`Missing / outdated: ${missing.length} month file(s)`);

  if (existing.length > 0) {
    const latestExisting = existing[0];
    console.log(
      `Latest stored month: ${latestExisting.key} (${latestExisting.count} puzzles)`
    );
  }

  if (missing.length === 0) {
    console.log("Nothing to fetch.");
    if (!dryRun) {
      console.log("Rebuilding all.json from existing files...");
      writeCombinedFiles(mergeAllMonthlyFiles());
    }
    console.log("Done.");
    return;
  }

  console.log("\nMonths to fetch:");
  for (const item of missing) {
    console.log(`  - ${item.key} (${item.reason})`);
  }

  if (dryRun) {
    console.log("\nDry run only — no requests sent.");
    return;
  }

  let fetchedCount = 0;

  const processMonth = async ({ monthDate, key }) => {
    const data = await fetchMonth(monthDate);
    writeMonthFile(monthDate, data);
    fetchedCount += 1;
    console.log(`Fetched ${key}: ${data.length} puzzle(s)`);
    return data;
  };

  for await (const _ of asyncPool(
    CONCURRENT_REQUESTS,
    missing,
    processMonth
  )) {
    // Results are written per month; merge happens after the pool finishes.
  }

  const allPuzzles = mergeAllMonthlyFiles();
  writeCombinedFiles(allPuzzles);

  console.log(`\nFetched ${fetchedCount} month file(s).`);
  console.log(`Total puzzles in all.json: ${allPuzzles.length}`);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
