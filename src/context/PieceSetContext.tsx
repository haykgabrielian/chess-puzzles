import React from "react";

import {
  defaultPieceSetId,
  getPieceSetById,
  type PieceSet,
} from "@/helpers/pieceSets";

export const PieceSetContext = React.createContext<{
  pieceSet: PieceSet;
  setPieceSetId: (id: string) => void;
}>({
  pieceSet: getPieceSetById(defaultPieceSetId),
  setPieceSetId: () => {},
});
