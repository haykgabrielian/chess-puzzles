import type { BoardMove } from '@/helpers/chess';
import type { Piece } from '@/helpers/fen';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const BLACK_ORIENTED_FILES = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] as const;
const BLACK_ORIENTED_RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export type BoardOrientation = 'white' | 'black';

export type FlyingPieceSpec = {
  id: string;
  piece: Piece;
  fromFileIndex: number;
  fromRankIndex: number;
  deltaFile: number;
  deltaRank: number;
};

export type MoveAnimationSpec = {
  key: string;
  pieces: FlyingPieceSpec[];
  hiddenSquares: ReadonlySet<string>;
};

export const MOVE_ANIMATION_MS = 200;

export const getMoveAnimationKey = (fen: string, lastMove: BoardMove): string =>
  `${fen}|${lastMove.from}|${lastMove.to}`;

const CASTLING_ROOK_MOVES: Record<string, BoardMove> = {
  'e1-g1': { from: 'h1', to: 'f1' },
  'e1-c1': { from: 'a1', to: 'd1' },
  'e8-g8': { from: 'h8', to: 'f8' },
  'e8-c8': { from: 'a8', to: 'd8' },
};

const getCastlingRookMove = (from: string, to: string): BoardMove | null =>
  CASTLING_ROOK_MOVES[`${from}-${to}`] ?? null;

const getDisplayAxes = (orientation: BoardOrientation) =>
  orientation === 'white'
    ? { displayFiles: FILES, displayRanks: RANKS }
    : { displayFiles: BLACK_ORIENTED_FILES, displayRanks: BLACK_ORIENTED_RANKS };

const getSquareDisplayIndices = (
  squareId: string,
  orientation: BoardOrientation,
): { fileIndex: number; rankIndex: number } => {
  const file = squareId[0];
  const rank = Number(squareId[1]) as (typeof RANKS)[number];
  const { displayFiles, displayRanks } = getDisplayAxes(orientation);

  return {
    fileIndex: displayFiles.indexOf(file as (typeof FILES)[number]),
    rankIndex: displayRanks.indexOf(rank),
  };
};

const getPieceAtSquare = (board: (Piece | null)[][], square: string): Piece | null => {
  const fileIndex = FILES.indexOf(square[0] as (typeof FILES)[number]);
  const rankIndex = RANKS.indexOf(Number(square[1]) as (typeof RANKS)[number]);
  return board[rankIndex]?.[fileIndex] ?? null;
};

const buildFlyingPieceSpec = (
  move: BoardMove,
  board: (Piece | null)[][],
  orientation: BoardOrientation,
  id: string,
): FlyingPieceSpec | null => {
  const piece = getPieceAtSquare(board, move.to);

  if (!piece) {
    return null;
  }

  const from = getSquareDisplayIndices(move.from, orientation);
  const to = getSquareDisplayIndices(move.to, orientation);

  return {
    id,
    piece,
    fromFileIndex: from.fileIndex,
    fromRankIndex: from.rankIndex,
    deltaFile: to.fileIndex - from.fileIndex,
    deltaRank: to.rankIndex - from.rankIndex,
  };
};

export const buildMoveAnimation = (
  lastMove: BoardMove,
  board: (Piece | null)[][],
  orientation: BoardOrientation,
): MoveAnimationSpec | null => {
  const moves: BoardMove[] = [lastMove];
  const castlingRook = getCastlingRookMove(lastMove.from, lastMove.to);

  if (castlingRook) {
    moves.push(castlingRook);
  }

  const pieces: FlyingPieceSpec[] = [];
  const hiddenSquares = new Set<string>();

  for (const [index, move] of moves.entries()) {
    const spec = buildFlyingPieceSpec(
      move,
      board,
      orientation,
      `${move.from}-${move.to}-${index}`,
    );

    if (!spec) {
      continue;
    }

    pieces.push(spec);
    hiddenSquares.add(move.from);
    hiddenSquares.add(move.to);
  }

  if (pieces.length === 0) {
    return null;
  }

  return {
    key: `${lastMove.from}-${lastMove.to}`,
    pieces,
    hiddenSquares,
  };
};
