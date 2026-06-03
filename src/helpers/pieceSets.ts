import threeDBishopBlack from '@/assets/3d/bb.png';
import threeDKingBlack from '@/assets/3d/bk.png';
import threeDKnightBlack from '@/assets/3d/bn.png';
import threeDPawnBlack from '@/assets/3d/bp.png';
import threeDQueenBlack from '@/assets/3d/bq.png';
import threeDRookBlack from '@/assets/3d/br.png';
import threeDBishopWhite from '@/assets/3d/wb.png';
import threeDKingWhite from '@/assets/3d/wk.png';
import threeDKnightWhite from '@/assets/3d/wn.png';
import threeDPawnWhite from '@/assets/3d/wp.png';
import threeDQueenWhite from '@/assets/3d/wq.png';
import threeDRookWhite from '@/assets/3d/wr.png';
import classicBishopBlack from '@/assets/classic/bishop_black.svg';
import classicBishopWhite from '@/assets/classic/bishop_white.svg';
import classicKingBlack from '@/assets/classic/king_black.svg';
import classicKingWhite from '@/assets/classic/king_white.svg';
import classicKnightBlack from '@/assets/classic/knight_black.svg';
import classicKnightWhite from '@/assets/classic/knight_white.svg';
import classicPawnBlack from '@/assets/classic/pwan_black.svg';
import classicPawnWhite from '@/assets/classic/pwan_white.svg';
import classicQueenBlack from '@/assets/classic/queen_black.svg';
import classicQueenWhite from '@/assets/classic/queen_white.svg';
import classicRookBlack from '@/assets/classic/rook_black.svg';
import classicRookWhite from '@/assets/classic/rook_white.svg';
import gothicBishopBlack from '@/assets/gotic/bb.png';
import gothicKingBlack from '@/assets/gotic/bk.png';
import gothicKnightBlack from '@/assets/gotic/bn.png';
import gothicPawnBlack from '@/assets/gotic/bp.png';
import gothicQueenBlack from '@/assets/gotic/bq.png';
import gothicRookBlack from '@/assets/gotic/br.png';
import gothicBishopWhite from '@/assets/gotic/wb.png';
import gothicKingWhite from '@/assets/gotic/wk.png';
import gothicKnightWhite from '@/assets/gotic/wn.png';
import gothicPawnWhite from '@/assets/gotic/wp.png';
import gothicQueenWhite from '@/assets/gotic/wq.png';
import gothicRookWhite from '@/assets/gotic/wr.png';
import modernBishopBlack from '@/assets/modern/bishop_black.svg';
import modernBishopWhite from '@/assets/modern/bishop_white.svg';
import modernKingBlack from '@/assets/modern/king_black.svg';
import modernKingWhite from '@/assets/modern/king_white.svg';
import modernKnightBlack from '@/assets/modern/knight_black.svg';
import modernKnightWhite from '@/assets/modern/knight_white.svg';
import modernPawnBlack from '@/assets/modern/pawn_black.svg';
import modernPawnWhite from '@/assets/modern/pawn_white.svg';
import modernQueenBlack from '@/assets/modern/queen_black.svg';
import modernQueenWhite from '@/assets/modern/queen_white.svg';
import modernRookBlack from '@/assets/modern/rook_black.svg';
import modernRookWhite from '@/assets/modern/rook_white.svg';
import type { Piece } from '@/helpers/fen';

export type PieceSet = {
  id: string;
  name: string;
  images: Record<Piece, string>;
};

const classicImages: Record<Piece, string> = {
  K: classicKingWhite,
  Q: classicQueenWhite,
  R: classicRookWhite,
  B: classicBishopWhite,
  N: classicKnightWhite,
  P: classicPawnWhite,
  k: classicKingBlack,
  q: classicQueenBlack,
  r: classicRookBlack,
  b: classicBishopBlack,
  n: classicKnightBlack,
  p: classicPawnBlack,
};

const modernImages: Record<Piece, string> = {
  K: modernKingWhite,
  Q: modernQueenWhite,
  R: modernRookWhite,
  B: modernBishopWhite,
  N: modernKnightWhite,
  P: modernPawnWhite,
  k: modernKingBlack,
  q: modernQueenBlack,
  r: modernRookBlack,
  b: modernBishopBlack,
  n: modernKnightBlack,
  p: modernPawnBlack,
};

const threeDImages: Record<Piece, string> = {
  K: threeDKingWhite,
  Q: threeDQueenWhite,
  R: threeDRookWhite,
  B: threeDBishopWhite,
  N: threeDKnightWhite,
  P: threeDPawnWhite,
  k: threeDKingBlack,
  q: threeDQueenBlack,
  r: threeDRookBlack,
  b: threeDBishopBlack,
  n: threeDKnightBlack,
  p: threeDPawnBlack,
};

const gothicImages: Record<Piece, string> = {
  K: gothicKingWhite,
  Q: gothicQueenWhite,
  R: gothicRookWhite,
  B: gothicBishopWhite,
  N: gothicKnightWhite,
  P: gothicPawnWhite,
  k: gothicKingBlack,
  q: gothicQueenBlack,
  r: gothicRookBlack,
  b: gothicBishopBlack,
  n: gothicKnightBlack,
  p: gothicPawnBlack,
};

export const pieceSets: PieceSet[] = [
  { id: 'classic', name: 'Classic', images: classicImages },
  { id: 'modern', name: 'Modern', images: modernImages },
  { id: '3d', name: '3D', images: threeDImages },
  { id: 'gotic', name: 'Gothic', images: gothicImages },
];

export const defaultPieceSetId = 'classic';

export const getPieceSetById = (id: string): PieceSet =>
  pieceSets.find(set => set.id === id) ?? pieceSets[0];
