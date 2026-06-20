import {
  type BoardMove,
  createGame,
  trySanMove,
} from '@/helpers/chess';
import { STARTING_FEN } from '@/helpers/fen';

export type PgnGameInfo = {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
};

export type FreeroamImportResult = {
  startingFen: string;
  moves: string[];
  fenByPly: string[];
  lastMoveByPly: (BoardMove | null)[];
  pgnInfo?: PgnGameInfo;
};

const PLACEHOLDER_HEADER_VALUES = new Set(['?', '????.??.??', '*']);

const readPgnHeader = (
  header: Record<string, string | null>,
  key: string,
): string | undefined => {
  const value = header[key]?.trim();

  if (!value || PLACEHOLDER_HEADER_VALUES.has(value)) {
    return undefined;
  }

  return value;
};

export const extractPgnGameInfo = (
  header: Record<string, string | null>,
): PgnGameInfo | undefined => {
  const pgnInfo: PgnGameInfo = {
    event: readPgnHeader(header, 'Event'),
    site: readPgnHeader(header, 'Site'),
    date: readPgnHeader(header, 'Date'),
    round: readPgnHeader(header, 'Round'),
    white: readPgnHeader(header, 'White'),
    black: readPgnHeader(header, 'Black'),
    result: readPgnHeader(header, 'Result'),
  };

  return Object.values(pgnInfo).some(Boolean) ? pgnInfo : undefined;
};

export type GameImportSuccess = {
  ok: true;
  result: FreeroamImportResult;
};

export type GameImportFailure = {
  ok: false;
  error: string;
};

export type GameImportOutcome = GameImportSuccess | GameImportFailure;

const buildImportResult = (
  startingFen: string,
  moves: string[],
): GameImportOutcome => {
  const game = createGame(startingFen);
  const fenByPly = [startingFen];
  const lastMoveByPly: (BoardMove | null)[] = [null];

  for (const san of moves) {
    const move = trySanMove(game, san);

    if (!move) {
      return { ok: false, error: 'PGN contains invalid moves.' };
    }

    fenByPly.push(game.fen());
    lastMoveByPly.push({ from: move.from, to: move.to });
  }

  return {
    ok: true,
    result: {
      startingFen,
      moves,
      fenByPly,
      lastMoveByPly,
    },
  };
};

export const parseFenImport = (text: string): GameImportOutcome => {
  const fen = text.trim();

  if (!fen) {
    return { ok: false, error: 'Paste a FEN string.' };
  }

  try {
    createGame(fen);
  } catch {
    return { ok: false, error: 'Invalid FEN.' };
  }

  return {
    ok: true,
    result: {
      startingFen: fen,
      moves: [],
      fenByPly: [fen],
      lastMoveByPly: [null],
    },
  };
};

export const parsePgnImport = (text: string): GameImportOutcome => {
  const pgn = text.trim();

  if (!pgn) {
    return { ok: false, error: 'Paste a PGN or choose a file.' };
  }

  const game = createGame(STARTING_FEN);

  try {
    game.loadPgn(pgn);
  } catch {
    return { ok: false, error: 'Could not parse PGN.' };
  }

  const moves = game.history();
  const header = game.header();
  const startingFen =
    header.SetUp === '1' && header.FEN ? header.FEN : STARTING_FEN;
  const built = buildImportResult(startingFen, moves);

  if (!built.ok) {
    return built;
  }

  return {
    ok: true,
    result: {
      ...built.result,
      pgnInfo: extractPgnGameInfo(header),
    },
  };
};

export const FREEROAM_PGN_EVENT = 'chess puzzles practice';
export const FREEROAM_PGN_SITE = 'chesspuzzles.am';

export const DEFAULT_PGN_TEMPLATE = `[Event "?"]
[Site "?"]
[Date "????.??.??"]
[Round "?"]
[White "?"]
[Black "?"]
[Result "*"]

`;

export const hasFreeroamProgress = (
  startingFen: string,
  moves: string[],
): boolean => moves.length > 0 || startingFen !== STARTING_FEN;

const parsePgnHeadersFromText = (
  pgnText: string,
): Record<string, string | null> => {
  const headers: Record<string, string | null> = {};

  for (const match of pgnText.matchAll(/\[(\w+)\s+"([^"]*)"\]/g)) {
    headers[match[1]!] = match[2] ?? null;
  }

  return headers;
};

export const pgnTextHasImportedMetadata = (pgnText: string): boolean =>
  extractPgnGameInfo(parsePgnHeadersFromText(pgnText)) !== undefined;

export const shouldApplyFreeroamPgnHeaders = (
  startingFen: string,
  moves: string[],
  pgnInfo?: PgnGameInfo | null,
  pgnText?: string,
): boolean => {
  if (!hasFreeroamProgress(startingFen, moves)) {
    return false;
  }

  if (pgnInfo) {
    return false;
  }

  if (pgnText && pgnTextHasImportedMetadata(pgnText)) {
    return false;
  }

  return true;
};

export const exportFreeroamPgn = (
  startingFen: string,
  moves: string[],
  pgnInfo?: PgnGameInfo | null,
): string => {
  if (!hasFreeroamProgress(startingFen, moves)) {
    return DEFAULT_PGN_TEMPLATE.trimEnd();
  }

  const game = createGame(startingFen);

  for (const san of moves) {
    if (!trySanMove(game, san)) {
      break;
    }
  }

  game.header('Event', pgnInfo?.event ?? '?');
  game.header('Site', pgnInfo?.site ?? '?');
  game.header('Date', pgnInfo?.date ?? '????.??.??');
  game.header('Round', pgnInfo?.round ?? '?');
  game.header('White', pgnInfo?.white ?? '?');
  game.header('Black', pgnInfo?.black ?? '?');
  game.header('Result', pgnInfo?.result ?? '*');

  if (startingFen !== STARTING_FEN) {
    game.header('SetUp', '1');
    game.header('FEN', startingFen);
  }

  const pgn = game.pgn();

  if (pgnInfo) {
    return pgn.trimEnd();
  }

  return applyFreeroamPgnHeaders(pgn).trimEnd();
};

const formatPgnDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
};

const setPgnHeader = (pgn: string, key: string, value: string): string => {
  const headerPattern = new RegExp(`\\[${key}\\s+"[^"]*"\\]`, 'i');
  const headerLine = `[${key} "${value}"]`;

  if (headerPattern.test(pgn)) {
    return pgn.replace(headerPattern, headerLine);
  }

  return `${headerLine}\n${pgn}`;
};

export const applyFreeroamPgnHeaders = (
  pgnText: string,
  date: Date = new Date(),
): string => {
  let pgn = pgnText.trimEnd();
  pgn = setPgnHeader(pgn, 'Event', FREEROAM_PGN_EVENT);
  pgn = setPgnHeader(pgn, 'Site', FREEROAM_PGN_SITE);
  pgn = setPgnHeader(pgn, 'Date', formatPgnDate(date));

  return `${pgn}\n`;
};

export const preparePgnForDownload = (
  pgnText: string,
  options: {
    startingFen: string;
    moves: string[];
    pgnInfo?: PgnGameInfo | null;
  },
  date: Date = new Date(),
): string => {
  const trimmed = pgnText.trimEnd();

  if (
    shouldApplyFreeroamPgnHeaders(
      options.startingFen,
      options.moves,
      options.pgnInfo,
      pgnText,
    )
  ) {
    return applyFreeroamPgnHeaders(trimmed, date).trimEnd();
  }

  return trimmed;
};
