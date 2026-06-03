import React, { ReactNode, useState } from 'react';

import { PieceSetContext } from '@/context/PieceSetContext';
import { defaultPieceSetId, getPieceSetById, pieceSets } from '@/helpers/pieceSets';

const PIECE_SET_STORAGE_KEY = 'chess-piece-set';

const getInitialPieceSetId = () => {
  const saved = localStorage.getItem(PIECE_SET_STORAGE_KEY);
  return pieceSets.some(set => set.id === saved) ? saved! : defaultPieceSetId;
};

const PieceSetProvider = ({ children }: { children: ReactNode }) => {
  const [pieceSetId, setPieceSetIdState] = useState(getInitialPieceSetId);

  const setPieceSetId = (id: string) => {
    localStorage.setItem(PIECE_SET_STORAGE_KEY, id);
    setPieceSetIdState(id);
  };

  return (
    <PieceSetContext.Provider
      value={{
        pieceSet: getPieceSetById(pieceSetId),
        setPieceSetId,
      }}
    >
      {children}
    </PieceSetContext.Provider>
  );
};

export default PieceSetProvider;
