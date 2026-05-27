# Chess Puzzles

Browse Chess.com daily puzzles by date. Pick a day on the calendar, load the puzzle for that date, and solve it on a themed board.

## Setup

### Prerequisites

- Node.js 18+
- npm

### Install and run

```sh
git clone https://github.com/haykgabrielian/Chess-Puzzle.git
cd Chess-Puzzle
npm install
npm run dev
```

Open `http://localhost:5173`. The app redirects to today's date, for example `/2026-05-27`.

### Puzzle data

The `puzzle/` folder is **not** included in this repository. It contains monthly JSON files fetched from Chess.com and is listed in `.gitignore` so puzzle data stays local.

Generate it before running the app:

```sh
cd job
npm install
npm run sync
```

This creates `puzzle/{year}/{year}-{month}.json` at the project root. The dev server and production build serve files from that folder.

Useful job commands:

| Command | Description |
|---------|-------------|
| `npm run sync` | Fetch missing months |
| `npm run sync:check` | Dry run — show what would be fetched |
| `npm run sync:force` | Re-fetch all months |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint:check` | ESLint |
| `npm run lint` | ESLint with auto-fix |

## Tech stack

- React 19 + TypeScript
- Vite
- TanStack Router — date-based URLs (`/YYYY-MM-DD`)
- TanStack Query — monthly puzzle fetching
- styled-components — UI and themes

## Project structure

```
src/
├── api/           # Puzzle fetch helpers
├── assets/        # Logos and piece SVGs
├── components/    # Board, sidebar, header
├── context/       # Puzzle, theme, board theme providers
├── helpers/       # FEN, dates, board themes
├── hooks/         # usePuzzleForDate
├── pages/         # Home
└── router.tsx     # /$date routes

job/               # Chess.com puzzle sync script
puzzle/            # Generated puzzle JSON (local only, gitignored)
```

## License

MIT
