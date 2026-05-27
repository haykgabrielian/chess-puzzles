export type Puzzle = {
  id: number;
  title: string;
  pgn: string;
  date: string;
  comment_count: number;
  solved_count: number;
  parsed: {
    moves: string[];
    raw: string;
    result: string;
    fen: string;
  };
  viewerUrl: string;
};
