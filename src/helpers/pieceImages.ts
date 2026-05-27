import bishopBlack from '@/assets/bishop_black.svg';
import bishopWhite from '@/assets/bishop_white.svg';
import kingBlack from '@/assets/king_black.svg';
import kingWhite from '@/assets/king_white.svg';
import knightBlack from '@/assets/knight_black.svg';
import knightWhite from '@/assets/knight_white.svg';
import pawnBlack from '@/assets/pwan_black.svg';
import pawnWhite from '@/assets/pwan_white.svg';
import queenBlack from '@/assets/queen_black.svg';
import queenWhite from '@/assets/queen_white.svg';
import rookBlack from '@/assets/rook_black.svg';
import rookWhite from '@/assets/rook_white.svg';
import type { Piece } from '@/helpers/fen';

export const PIECE_IMAGES: Record<Piece, string> = {
  K: kingWhite,
  Q: queenWhite,
  R: rookWhite,
  B: bishopWhite,
  N: knightWhite,
  P: pawnWhite,
  k: kingBlack,
  q: queenBlack,
  r: rookBlack,
  b: bishopBlack,
  n: knightBlack,
  p: pawnBlack,
};
