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
import condalBishopBlack from "@/assets/condal/bb.png";
import condalKingBlack from "@/assets/condal/bk.png";
import condalKnightBlack from "@/assets/condal/bn.png";
import condalPawnBlack from "@/assets/condal/bp.png";
import condalQueenBlack from "@/assets/condal/bq.png";
import condalRookBlack from "@/assets/condal/br.png";
import condalBishopWhite from "@/assets/condal/wb.png";
import condalKingWhite from "@/assets/condal/wk.png";
import condalKnightWhite from "@/assets/condal/wn.png";
import condalPawnWhite from "@/assets/condal/wp.png";
import condalQueenWhite from "@/assets/condal/wq.png";
import condalRookWhite from "@/assets/condal/wr.png";
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
import imperialBishopBlack from "@/assets/Imperial/bb.png";
import imperialKingBlack from "@/assets/Imperial/bk.png";
import imperialKnightBlack from "@/assets/Imperial/bn.png";
import imperialPawnBlack from "@/assets/Imperial/bp.png";
import imperialQueenBlack from "@/assets/Imperial/bq.png";
import imperialRookBlack from "@/assets/Imperial/br.png";
import imperialBishopWhite from "@/assets/Imperial/wb.png";
import imperialKingWhite from "@/assets/Imperial/wk.png";
import imperialKnightWhite from "@/assets/Imperial/wn.png";
import imperialPawnWhite from "@/assets/Imperial/wp.png";
import imperialQueenWhite from "@/assets/Imperial/wq.png";
import imperialRookWhite from "@/assets/Imperial/wr.png";
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

const condalImages: Record<Piece, string> = {
  K: condalKingWhite,
  Q: condalQueenWhite,
  R: condalRookWhite,
  B: condalBishopWhite,
  N: condalKnightWhite,
  P: condalPawnWhite,
  k: condalKingBlack,
  q: condalQueenBlack,
  r: condalRookBlack,
  b: condalBishopBlack,
  n: condalKnightBlack,
  p: condalPawnBlack,
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

const imperialImages: Record<Piece, string> = {
  K: imperialKingWhite,
  Q: imperialQueenWhite,
  R: imperialRookWhite,
  B: imperialBishopWhite,
  N: imperialKnightWhite,
  P: imperialPawnWhite,
  k: imperialKingBlack,
  q: imperialQueenBlack,
  r: imperialRookBlack,
  b: imperialBishopBlack,
  n: imperialKnightBlack,
  p: imperialPawnBlack,
};

export const pieceSets: PieceSet[] = [
  { id: "imperial", name: "Imperial", images: imperialImages },
  { id: "classic", name: "Classic", images: classicImages },
  { id: "modern", name: "Modern", images: modernImages },
  { id: "gotic", name: "Gothic", images: gothicImages },
  { id: "newspaper", name: "Newspaper", images: newspaperImages },
  { id: "club", name: "Club", images: clubImages },
  { id: "maya", name: "Maya", images: mayaImages },
  { id: "condal", name: "Condal", images: condalImages },
];

export const defaultPieceSetId = "classic";

export const getPieceSetById = (id: string): PieceSet =>
  pieceSets.find((set) => set.id === id) ?? pieceSets[0];
