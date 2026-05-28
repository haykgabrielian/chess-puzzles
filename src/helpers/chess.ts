import { Chess, type Move, type Square } from 'chess.js';

export type BoardMove = {
  from: string;
  to: string;
};

export function createGame(fen: string): Chess {
  return new Chess(fen);
}

export function getLegalTargetSquares(game: Chess, from: Square): Square[] {
  const moves = game.moves({ square: from, verbose: true }) as Move[];
  return [...new Set(moves.map(move => move.to))];
}

export function tryMove(
  game: Chess,
  from: Square,
  to: Square,
  promotion: 'q' | 'r' | 'b' | 'n' = 'q',
): Move | null {
  const moves = game.moves({ square: from, verbose: true }) as Move[];
  const matching = moves.filter(move => move.to === to);

  if (matching.length === 0) {
    return null;
  }

  const selected =
    matching.find(move => move.promotion === promotion) ??
    matching.find(move => !move.promotion) ??
    matching[0];

  try {
    return game.move({
      from,
      to,
      promotion: selected.promotion ?? promotion,
    });
  } catch {
    return null;
  }
}

export function trySanMove(game: Chess, san: string): Move | null {
  try {
    return game.move(san);
  } catch {
    return null;
  }
}

export function normalizeSan(san: string): string {
  return san.replace(/[+#!?]+$/, '');
}

export function movesMatch(actual: string, expected: string): boolean {
  return normalizeSan(actual) === normalizeSan(expected);
}

export function getMoveSquares(fen: string, san: string): BoardMove | null {
  const game = createGame(fen);
  const move = trySanMove(game, san);

  if (!move) {
    return null;
  }

  return { from: move.from, to: move.to };
}

const PIECE_NAMES: Record<Move['piece'], string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

const PROMOTION_NAMES: Record<string, string> = {
  q: 'queen',
  r: 'rook',
  b: 'bishop',
  n: 'knight',
};

const appendMoveOutcome = (sentence: string, san: string): string => {
  if (san.includes('#')) {
    return `${sentence} — that gives checkmate.`;
  }

  if (san.includes('+')) {
    return `${sentence}, putting the opponent in check.`;
  }

  return `${sentence}.`;
};

const describeMove = (move: Move): string => {
  if (move.isKingsideCastle()) {
    return 'Try castling kingside';
  }

  if (move.isQueensideCastle()) {
    return 'Try castling queenside';
  }

  const piece = PIECE_NAMES[move.piece];
  const to = move.to;

  if (move.isPromotion()) {
    const promotion = move.promotion ? PROMOTION_NAMES[move.promotion] : 'queen';
    return `Try moving your pawn to ${to} and promoting to a ${promotion}`;
  }

  if (move.isEnPassant()) {
    return `Try capturing en passant on ${to}`;
  }

  if (move.isCapture()) {
    if (move.piece === 'p') {
      return `Try capturing on ${to} with your pawn`;
    }

    return `Try capturing on ${to} with your ${piece}`;
  }

  if (move.piece === 'p') {
    return `Try moving your pawn to ${to}`;
  }

  return `Try moving your ${piece} to ${to}`;
};

export function formatHintSentence(fen: string, san: string): string {
  const game = createGame(fen);
  const move = trySanMove(game, san);

  if (!move) {
    return `Try playing ${normalizeSan(san)}.`;
  }

  return appendMoveOutcome(describeMove(move), san);
}

export function isUserMoveIndex(moveIndex: number): boolean {
  return moveIndex % 2 === 0;
}
