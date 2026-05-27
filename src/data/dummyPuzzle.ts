import type { Puzzle } from '@/types/puzzle';

export const DUMMY_PUZZLE_DATE = '2007-05-08';

export const getDummyPuzzleDate = (): Date => new Date(2007, 4, 8);

export const DUMMY_PUZZLE: Puzzle = {
  id: 19,
  title: 'Unstoppable mate...',
  pgn: '[Result "*"]\r\n[FEN "r1qnr2k/1b3p1p/1p2p3/1Pp5/6Qp/PR2R2P/5PP1/6K1 w - - 0 1"]\r\n\r\n1. Rg3 hxg3 2. Rxg3 Be4 3. Qg7# *',
  date: DUMMY_PUZZLE_DATE,
  comment_count: 593,
  solved_count: 5152,
  parsed: {
    moves: ['Rg3', 'hxg3', 'Rxg3', 'Be4', 'Qg7#'],
    raw: '1. Rg3 hxg3 2. Rxg3 Be4 3. Qg7# *',
    result: '*',
    fen: 'r1qnr2k/1b3p1p/1p2p3/1Pp5/6Qp/PR2R2P/5PP1/6K1 w - - 0 1',
  },
  viewerUrl:
    'https://chess-board.fly.dev/?fen=r1qnr2k/1b3p1p/1p2p3/1Pp5/6Qp/PR2R2P/5PP1/6K1 w - - 0 1',
};
