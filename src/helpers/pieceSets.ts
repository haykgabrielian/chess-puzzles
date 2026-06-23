import threeDBishopBlack from "@/assets/3d/bb.png";
import threeDKingBlack from "@/assets/3d/bk.png";
import threeDKnightBlack from "@/assets/3d/bn.png";
import threeDPawnBlack from "@/assets/3d/bp.png";
import threeDQueenBlack from "@/assets/3d/bq.png";
import threeDRookBlack from "@/assets/3d/br.png";
import threeDBishopWhite from "@/assets/3d/wb.png";
import threeDKingWhite from "@/assets/3d/wk.png";
import threeDKnightWhite from "@/assets/3d/wn.png";
import threeDPawnWhite from "@/assets/3d/wp.png";
import threeDQueenWhite from "@/assets/3d/wq.png";
import threeDRookWhite from "@/assets/3d/wr.png";
import eightBitBishopBlack from "@/assets/8bit/bb.png";
import eightBitKingBlack from "@/assets/8bit/bk.png";
import eightBitKnightBlack from "@/assets/8bit/bn.png";
import eightBitPawnBlack from "@/assets/8bit/bp.png";
import eightBitQueenBlack from "@/assets/8bit/bq.png";
import eightBitRookBlack from "@/assets/8bit/br.png";
import eightBitBishopWhite from "@/assets/8bit/wb.png";
import eightBitKingWhite from "@/assets/8bit/wk.png";
import eightBitKnightWhite from "@/assets/8bit/wn.png";
import eightBitPawnWhite from "@/assets/8bit/wp.png";
import eightBitQueenWhite from "@/assets/8bit/wq.png";
import eightBitRookWhite from "@/assets/8bit/wr.png";
import classicBishopBlack from "@/assets/classic/bishop_black.svg";
import classicBishopWhite from "@/assets/classic/bishop_white.svg";
import classicKingBlack from "@/assets/classic/king_black.svg";
import classicKingWhite from "@/assets/classic/king_white.svg";
import classicKnightBlack from "@/assets/classic/knight_black.svg";
import classicKnightWhite from "@/assets/classic/knight_white.svg";
import classicPawnBlack from "@/assets/classic/pwan_black.svg";
import classicPawnWhite from "@/assets/classic/pwan_white.svg";
import classicQueenBlack from "@/assets/classic/queen_black.svg";
import classicQueenWhite from "@/assets/classic/queen_white.svg";
import classicRookBlack from "@/assets/classic/rook_black.svg";
import classicRookWhite from "@/assets/classic/rook_white.svg";
import gothicBishopBlack from "@/assets/gotic/bb.png";
import gothicKingBlack from "@/assets/gotic/bk.png";
import gothicKnightBlack from "@/assets/gotic/bn.png";
import gothicPawnBlack from "@/assets/gotic/bp.png";
import gothicQueenBlack from "@/assets/gotic/bq.png";
import gothicRookBlack from "@/assets/gotic/br.png";
import gothicBishopWhite from "@/assets/gotic/wb.png";
import gothicKingWhite from "@/assets/gotic/wk.png";
import gothicKnightWhite from "@/assets/gotic/wn.png";
import gothicPawnWhite from "@/assets/gotic/wp.png";
import gothicQueenWhite from "@/assets/gotic/wq.png";
import gothicRookWhite from "@/assets/gotic/wr.png";
import modernBishopBlack from "@/assets/modern/bishop_black.svg";
import modernBishopWhite from "@/assets/modern/bishop_white.svg";
import modernKingBlack from "@/assets/modern/king_black.svg";
import modernKingWhite from "@/assets/modern/king_white.svg";
import modernKnightBlack from "@/assets/modern/knight_black.svg";
import modernKnightWhite from "@/assets/modern/knight_white.svg";
import modernPawnBlack from "@/assets/modern/pawn_black.svg";
import modernPawnWhite from "@/assets/modern/pawn_white.svg";
import modernQueenBlack from "@/assets/modern/queen_black.svg";
import modernQueenWhite from "@/assets/modern/queen_white.svg";
import modernRookBlack from "@/assets/modern/rook_black.svg";
import modernRookWhite from "@/assets/modern/rook_white.svg";
import clubBishopBlack from "@/assets/club/bb.png";
import clubKingBlack from "@/assets/club/bk.png";
import clubKnightBlack from "@/assets/club/bn.png";
import clubPawnBlack from "@/assets/club/bp.png";
import clubQueenBlack from "@/assets/club/bq.png";
import clubRookBlack from "@/assets/club/br.png";
import clubBishopWhite from "@/assets/club/wb.png";
import clubKingWhite from "@/assets/club/wk.png";
import clubKnightWhite from "@/assets/club/wn.png";
import clubPawnWhite from "@/assets/club/wp.png";
import clubQueenWhite from "@/assets/club/wq.png";
import clubRookWhite from "@/assets/club/wr.png";
import mayaBishopBlack from "@/assets/maya/bb.png";
import mayaKingBlack from "@/assets/maya/bk.png";
import mayaKnightBlack from "@/assets/maya/bn.png";
import mayaPawnBlack from "@/assets/maya/bp.png";
import mayaQueenBlack from "@/assets/maya/bq.png";
import mayaRookBlack from "@/assets/maya/br.png";
import mayaBishopWhite from "@/assets/maya/wb.png";
import mayaKingWhite from "@/assets/maya/wk.png";
import mayaKnightWhite from "@/assets/maya/wn.png";
import mayaPawnWhite from "@/assets/maya/wp.png";
import mayaQueenWhite from "@/assets/maya/wq.png";
import mayaRookWhite from "@/assets/maya/wr.png";
import newspaperBishopBlack from "@/assets/newspaper/bb.png";
import newspaperKingBlack from "@/assets/newspaper/bk.png";
import newspaperKnightBlack from "@/assets/newspaper/bn.png";
import newspaperPawnBlack from "@/assets/newspaper/bp.png";
import newspaperQueenBlack from "@/assets/newspaper/bq.png";
import newspaperRookBlack from "@/assets/newspaper/br.png";
import newspaperBishopWhite from "@/assets/newspaper/wb.png";
import newspaperKingWhite from "@/assets/newspaper/wk.png";
import newspaperKnightWhite from "@/assets/newspaper/wn.png";
import newspaperPawnWhite from "@/assets/newspaper/wp.png";
import newspaperQueenWhite from "@/assets/newspaper/wq.png";
import newspaperRookWhite from "@/assets/newspaper/wr.png";
import type { Piece } from "@/helpers/fen";

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

const eightBitImages: Record<Piece, string> = {
  K: eightBitKingWhite,
  Q: eightBitQueenWhite,
  R: eightBitRookWhite,
  B: eightBitBishopWhite,
  N: eightBitKnightWhite,
  P: eightBitPawnWhite,
  k: eightBitKingBlack,
  q: eightBitQueenBlack,
  r: eightBitRookBlack,
  b: eightBitBishopBlack,
  n: eightBitKnightBlack,
  p: eightBitPawnBlack,
};

const clubImages: Record<Piece, string> = {
  K: clubKingWhite,
  Q: clubQueenWhite,
  R: clubRookWhite,
  B: clubBishopWhite,
  N: clubKnightWhite,
  P: clubPawnWhite,
  k: clubKingBlack,
  q: clubQueenBlack,
  r: clubRookBlack,
  b: clubBishopBlack,
  n: clubKnightBlack,
  p: clubPawnBlack,
};

const mayaImages: Record<Piece, string> = {
  K: mayaKingWhite,
  Q: mayaQueenWhite,
  R: mayaRookWhite,
  B: mayaBishopWhite,
  N: mayaKnightWhite,
  P: mayaPawnWhite,
  k: mayaKingBlack,
  q: mayaQueenBlack,
  r: mayaRookBlack,
  b: mayaBishopBlack,
  n: mayaKnightBlack,
  p: mayaPawnBlack,
};

const newspaperImages: Record<Piece, string> = {
  K: newspaperKingWhite,
  Q: newspaperQueenWhite,
  R: newspaperRookWhite,
  B: newspaperBishopWhite,
  N: newspaperKnightWhite,
  P: newspaperPawnWhite,
  k: newspaperKingBlack,
  q: newspaperQueenBlack,
  r: newspaperRookBlack,
  b: newspaperBishopBlack,
  n: newspaperKnightBlack,
  p: newspaperPawnBlack,
};

export const pieceSets: PieceSet[] = [
  { id: "classic", name: "Classic", images: classicImages },
  { id: "modern", name: "Modern", images: modernImages },
  { id: "3d", name: "3D", images: threeDImages },
  { id: "gotic", name: "Gothic", images: gothicImages },
  { id: "8bit", name: "8-Bit", images: eightBitImages },
  { id: "newspaper", name: "Newspaper", images: newspaperImages },
  { id: "club", name: "Club", images: clubImages },
  { id: "maya", name: "Maya", images: mayaImages },
];

export const defaultPieceSetId = "classic";

export const getPieceSetById = (id: string): PieceSet =>
  pieceSets.find((set) => set.id === id) ?? pieceSets[0];
