import { STARTING_FEN } from '@/helpers/fen';
import type { Puzzle } from '@/types/puzzle';

export const createPlaceholderPuzzle = (dateString: string): Puzzle => ({
  id: 0,
  title: "Today's puzzle isn't available yet",
  pgn: '',
  date: dateString,
  comment_count: 0,
  solved_count: 0,
  parsed: {
    moves: [],
    raw: '',
    result: '*',
    fen: STARTING_FEN,
  },
  viewerUrl: '',
});
