import { Chess, type Move, type Square } from 'chess.js';

import { STARTING_FEN } from '@/helpers/fen';

export type BoardMove = {
  from: string;
  to: string;
};

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

export const PROMOTION_PIECES: PromotionPiece[] = ['q', 'r', 'b', 'n'];

export type GameOutcome = 'playing' | 'checkmate' | 'stalemate';

export const createGame = (fen: string): Chess => new Chess(fen);

export const getGameOutcome = (game: Chess): GameOutcome => {
  if (game.isCheckmate()) {
    return 'checkmate';
  }

  if (game.isStalemate()) {
    return 'stalemate';
  }

  return 'playing';
};

export const getCheckmateWinner = (game: Chess): 'White' | 'Black' =>
  game.turn() === 'w' ? 'Black' : 'White';

export const getCheckmatedKingSquare = (game: Chess): string | null => {
  if (!game.isCheckmate()) {
    return null;
  }

  const sideToMove = game.turn();
  const board = game.board();

  for (let rankIndex = 0; rankIndex < board.length; rankIndex += 1) {
    for (let fileIndex = 0; fileIndex < board[rankIndex].length; fileIndex += 1) {
      const piece = board[rankIndex][fileIndex];

      if (piece?.type === 'k' && piece.color === sideToMove) {
        return `${'abcdefgh'[fileIndex]}${8 - rankIndex}`;
      }
    }
  }

  return null;
};

export const getLegalTargetSquares = (game: Chess, from: Square): Square[] => {
  const moves = game.moves({ square: from, verbose: true }) as Move[];
  return [...new Set(moves.map(move => move.to))];
};

export const isPromotionMove = (game: Chess, from: Square, to: Square): boolean => {
  const moves = game.moves({ square: from, verbose: true }) as Move[];
  return moves.some(move => move.to === to && move.promotion);
};

export const tryMove = (
  game: Chess,
  from: Square,
  to: Square,
  promotion: 'q' | 'r' | 'b' | 'n' = 'q',
): Move | null => {
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
};

export type CapturedPieces = {
  byWhite: Move['piece'][];
  byBlack: Move['piece'][];
};

const CAPTURED_PIECE_ORDER: Record<Move['piece'], number> = {
  q: 0,
  r: 1,
  b: 2,
  n: 3,
  p: 4,
  k: 5,
};

const sortCapturedPieces = (pieces: Move['piece'][]): Move['piece'][] =>
  [...pieces].sort(
    (left, right) => CAPTURED_PIECE_ORDER[left] - CAPTURED_PIECE_ORDER[right],
  );

export const getCapturedPieces = (game: Chess): CapturedPieces => {
  const byWhite: Move['piece'][] = [];
  const byBlack: Move['piece'][] = [];

  for (const move of game.history({ verbose: true })) {
    if (!move.captured) {
      continue;
    }

    if (move.color === 'w') {
      byWhite.push(move.captured);
    } else {
      byBlack.push(move.captured);
    }
  }

  return {
    byWhite: sortCapturedPieces(byWhite),
    byBlack: sortCapturedPieces(byBlack),
  };
};

export const trySanMove = (game: Chess, san: string): Move | null => {
  try {
    return game.move(san);
  } catch {
    return null;
  }
};

export const normalizeSan = (san: string): string =>
  san.replace(/[+#!?]+$/, '');

export const movesMatch = (actual: string, expected: string): boolean =>
  normalizeSan(actual) === normalizeSan(expected);

export const getMoveSquares = (fen: string, san: string): BoardMove | null => {
  const game = createGame(fen);
  const move = trySanMove(game, san);

  if (!move) {
    return null;
  }

  return { from: move.from, to: move.to };
};

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

export const formatHintSentence = (fen: string, san: string): string => {
  const game = createGame(fen);
  const move = trySanMove(game, san);

  if (!move) {
    return `Try playing ${normalizeSan(san)}.`;
  }

  return appendMoveOutcome(describeMove(move), san);
};

export const isUserMoveIndex = (moveIndex: number): boolean =>
  moveIndex % 2 === 0;

export type HistoryRowKind = 'mainline' | 'variation';

export type MoveHistoryRow = {
  key: string;
  number: number;
  white: string | null;
  black: string | null;
  whitePly: number | null;
  blackPly: number | null;
  isActive: boolean;
  pendingWhite: boolean;
  pendingBlack: boolean;
  isWhiteViewing: boolean;
  isBlackViewing: boolean;
  kind: HistoryRowKind;
  whiteContinuation: boolean;
};

/**
 * A temporary "sub-history" branch. It diverges from the mainline at `startPly`
 * (the mainline ply the user was viewing when they played the first branch
 * move). The parallel arrays mirror the mainline ones but are local to the
 * branch, so the mainline game is never mutated.
 */
export type Variation = {
  startPly: number;
  moves: string[];
  fenByPly: string[];
  lastMoveByPly: (BoardMove | null)[];
};

const isRowActive = (
  positionIndex: number,
  whitePly: number | null,
  blackPly: number | null,
): boolean => positionIndex === whitePly || positionIndex === blackPly;

export const replayGame = (
  moves: string[],
  ply: number,
  startingFen: string = STARTING_FEN,
): Chess => {
  const game = createGame(startingFen);
  const clampedPly = Math.max(0, Math.min(ply, moves.length));

  for (let index = 0; index < clampedPly; index += 1) {
    game.move(moves[index]!);
  }

  return game;
};

const buildMainlineRows = (
  moves: string[],
  viewingPly: number,
  showPending: boolean,
): MoveHistoryRow[] => {
  const rows: MoveHistoryRow[] = [];
  const completedPairs = Math.floor(moves.length / 2);

  for (let index = 0; index < completedPairs; index += 1) {
    const rowNumber = index + 1;
    const whitePly = index * 2 + 1;
    const blackPly = index * 2 + 2;

    rows.push({
      key: `main-${rowNumber}`,
      number: rowNumber,
      white: moves[index * 2] ?? null,
      black: moves[index * 2 + 1] ?? null,
      whitePly,
      blackPly,
      isActive: isRowActive(viewingPly, whitePly, blackPly),
      pendingWhite: false,
      pendingBlack: false,
      isWhiteViewing: viewingPly === whitePly,
      isBlackViewing: viewingPly === blackPly,
      kind: 'mainline',
      whiteContinuation: false,
    });
  }

  if (moves.length % 2 === 1) {
    const rowNumber = completedPairs + 1;

    rows.push({
      key: `main-${rowNumber}`,
      number: rowNumber,
      white: moves[moves.length - 1] ?? null,
      black: null,
      whitePly: moves.length,
      blackPly: null,
      isActive: viewingPly === moves.length,
      pendingWhite: false,
      pendingBlack: showPending,
      isWhiteViewing: viewingPly === moves.length,
      isBlackViewing: false,
      kind: 'mainline',
      whiteContinuation: false,
    });
  }

  return rows;
};

/**
 * Builds variation rows. Plies are expressed as positions on the "effective
 * line" (mainline up to `startPly`, then the branch), so they can be used
 * directly to navigate. The first branch move follows whichever side is to move
 * at `startPly`; if that's Black, the row leads with a continuation placeholder.
 */
const buildVariationRows = (
  variation: Variation,
  positionIndex: number,
): MoveHistoryRow[] => {
  const rows: MoveHistoryRow[] = [];
  const { startPly, moves } = variation;
  let index = 0;

  while (index < moves.length) {
    const moveNumber = Math.floor((startPly + index) / 2) + 1;
    const whiteToMove = (startPly + index) % 2 === 0;

    if (whiteToMove) {
      const whitePly = startPly + index + 1;
      const hasBlack = index + 1 < moves.length;
      const blackPly = hasBlack ? startPly + index + 2 : null;

      rows.push({
        key: `var-${startPly}-${index}`,
        number: moveNumber,
        white: moves[index] ?? null,
        black: hasBlack ? (moves[index + 1] ?? null) : null,
        whitePly,
        blackPly,
        isActive: isRowActive(positionIndex, whitePly, blackPly),
        pendingWhite: false,
        pendingBlack: false,
        isWhiteViewing: positionIndex === whitePly,
        isBlackViewing: blackPly !== null && positionIndex === blackPly,
        kind: 'variation',
        whiteContinuation: false,
      });
      index += 2;
    } else {
      const blackPly = startPly + index + 1;

      rows.push({
        key: `var-${startPly}-${index}`,
        number: moveNumber,
        white: null,
        black: moves[index] ?? null,
        whitePly: null,
        blackPly,
        isActive: positionIndex === blackPly,
        pendingWhite: false,
        pendingBlack: false,
        isWhiteViewing: false,
        isBlackViewing: positionIndex === blackPly,
        kind: 'variation',
        whiteContinuation: true,
      });
      index += 1;
    }
  }

  return rows;
};

export const getFreeroamHistoryRows = (
  moves: string[],
  positionIndex: number,
  isLiveGameOver: boolean,
  variation: Variation | null = null,
): MoveHistoryRow[] => {
  const onVariation = variation !== null && positionIndex > variation.startPly;
  const viewingMainlinePly = onVariation ? -1 : positionIndex;
  const showPending = !onVariation && positionIndex === moves.length && !isLiveGameOver;
  const rows = buildMainlineRows(moves, viewingMainlinePly, showPending);

  if (!variation) {
    return rows;
  }

  const variationRows = buildVariationRows(variation, positionIndex);
  const insertAt =
    variation.startPly === 0 ? 0 : Math.ceil(variation.startPly / 2);

  return [
    ...rows.slice(0, insertAt),
    ...variationRows,
    ...rows.slice(insertAt),
  ];
};
