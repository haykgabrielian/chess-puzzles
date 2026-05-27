export type Piece = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P' | 'k' | 'q' | 'r' | 'b' | 'n' | 'p';

export function parseFenBoard(fen: string): (Piece | null)[][] {
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
}

export function getSideToMove(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

export function getSideLabel(fen: string): string {
  return getSideToMove(fen) === 'w' ? 'White' : 'Black';
}

export function getPuzzleGoal(moves: string[]): string {
  const lastMove = moves.at(-1);

  if (lastMove?.includes('#')) {
    return 'checkmate';
  }

  if (lastMove?.includes('+')) {
    return 'win';
  }

  return 'win';
}
