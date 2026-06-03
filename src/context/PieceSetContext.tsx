import React from 'react';

import {
  type PieceSet,
  defaultPieceSetId,
  getPieceSetById,
} from '@/helpers/pieceSets';

export const PieceSetContext = React.createContext<{
  pieceSet: PieceSet;
  setPieceSetId: (id: string) => void;
}>({
  pieceSet: getPieceSetById(defaultPieceSetId),
  setPieceSetId: () => {},
});
