import { memo } from 'react';
import styled from 'styled-components';

import { PROMOTION_PIECES, type PromotionPiece } from '@/helpers/chess';
import type { Piece } from '@/helpers/fen';
import { PIECE_IMAGES } from '@/helpers/pieceImages';

type PromotionPickerProps = {
  opensDown: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PromotionPiece) => void;
};

const PIECE_BY_COLOR: Record<'w' | 'b', Record<PromotionPiece, Piece>> = {
  w: { q: 'Q', r: 'R', b: 'B', n: 'N' },
  b: { q: 'q', r: 'r', b: 'b', n: 'n' },
};

const PIECE_LABELS: Record<PromotionPiece, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
};

const PopupRoot = styled.div<{ $opensDown: boolean }>`
  position: absolute;
  left: 50%;
  top: 0;
  z-index: 20;
  pointer-events: none;
  transform: ${({ $opensDown }) =>
    $opensDown ? 'translate(-50%, 8px)' : 'translate(-50%, calc(-100% - 8px))'};
`;

const PopupMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: ${({ theme }) => theme.popover.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
`;

const PopupOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: transparent;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${({ theme }) => theme.button.hover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: 1px;
  }
`;

const PopupPieceImage = styled.img`
  width: 85%;
  height: 85%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
`;

const PromotionPicker = ({ opensDown, color, onSelect }: PromotionPickerProps) => (
  <PopupRoot
    $opensDown={opensDown}
    role="dialog"
    aria-label="Choose promotion piece"
  >
    <PopupMenu>
      {PROMOTION_PIECES.map(piece => (
        <PopupOption
          key={piece}
          type="button"
          aria-label={PIECE_LABELS[piece]}
          onClick={event => {
            event.stopPropagation();
            onSelect(piece);
          }}
        >
          <PopupPieceImage
            src={PIECE_IMAGES[PIECE_BY_COLOR[color][piece]]}
            alt=""
            draggable={false}
          />
        </PopupOption>
      ))}
    </PopupMenu>
  </PopupRoot>
);

export default memo(PromotionPicker);
