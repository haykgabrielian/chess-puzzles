import { useContext } from 'react';
import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { PieceSetContext } from '@/context/PieceSetContext';
import type { CapturedPieces } from '@/helpers/chess';
import type { Piece } from '@/helpers/fen';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CapturedRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const SideLabel = styled.span<{ $tone: 'light' | 'dark' }>`
  flex-shrink: 0;
  width: 44px;
  padding-top: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme, $tone }) =>
    $tone === 'light' ? theme.text.primary : theme.text.secondary};
  opacity: ${({ $tone }) => ($tone === 'light' ? 0.85 : 0.7)};
`;

const PieceStrip = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  min-width: 0;
  min-height: 28px;
  padding: 4px 8px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.button.background};
`;

const CapturedPiece = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.12));
`;

type CapturedPiecesProps = {
  captured: CapturedPieces;
};

type CapturedPieceType = CapturedPieces['byWhite'][number];

const toPieceImage = (piece: CapturedPieceType, capturedBy: 'w' | 'b'): Piece =>
  capturedBy === 'w' ? (piece as Piece) : (piece.toUpperCase() as Piece);

export const hasCapturedPieces = (captured: CapturedPieces): boolean =>
  captured.byWhite.length > 0 || captured.byBlack.length > 0;

type CapturedRowProps = {
  label: string;
  tone: 'light' | 'dark';
  pieces: CapturedPieceType[];
  capturedBy: 'w' | 'b';
};

const CapturedSideRow = ({ label, tone, pieces, capturedBy }: CapturedRowProps) => {
  const { pieceSet } = useContext(PieceSetContext);

  return (
    <CapturedRow aria-label={`Pieces captured by ${label}`}>
      <SideLabel $tone={tone}>{label}</SideLabel>
      <PieceStrip>
        {pieces.map((piece, index) => (
          <CapturedPiece
            key={`${capturedBy}-${piece}-${index}`}
            src={pieceSet.images[toPieceImage(piece, capturedBy)]}
            alt=""
            draggable={false}
          />
        ))}
      </PieceStrip>
    </CapturedRow>
  );
};

const CapturedPiecesDisplay = ({ captured }: CapturedPiecesProps) => {
  if (!hasCapturedPieces(captured)) {
    return null;
  }

  return (
    <Card title="Captured" collapsibleOnMobile>
      <Content>
        {captured.byBlack.length > 0 && (
          <CapturedSideRow
            label="Black"
            tone="dark"
            pieces={captured.byBlack}
            capturedBy="b"
          />
        )}
        {captured.byWhite.length > 0 && (
          <CapturedSideRow
            label="White"
            tone="light"
            pieces={captured.byWhite}
            capturedBy="w"
          />
        )}
      </Content>
    </Card>
  );
};

export default CapturedPiecesDisplay;
