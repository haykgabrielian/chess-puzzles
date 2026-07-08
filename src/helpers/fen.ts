export type Piece = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p';

export const STARTING_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const EMPTY_FEN = '8/8/8/8/8/8/8/8 w - - 0 1';

export const parseFenBoard = (fen: string): (Piece | null)[][] => {
  const ranks = fen.split(' ')[0].split('/');

  return ranks.map(rank => {
    const squares: (Piece | null)[] = [];

    for (const char of rank) {
      if (/\d/.test(char)) {
        for (let index = 0; index < Number(char); index += 1) {
          squares.push(null);
        }
      } else {
        squares.push(char as Piece);
      }
    }

    return squares;
  });
};

export const getSideToMove = (fen: string): 'w' | 'b' =>
  fen.split(' ')[1] === 'b' ? 'b' : 'w';

export const getSideLabel = (fen: string): string =>
  getSideToMove(fen) === 'w' ? 'White' : 'Black';

export const getPuzzleGoal = (moves: string[]): string => {
  const lastMove = moves.at(-1);

  if (lastMove?.includes('#')) {
    return 'checkmate';
  }

  if (lastMove?.includes('+')) {
    return 'win';
  }

  return 'win';
};
