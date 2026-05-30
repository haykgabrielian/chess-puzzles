import styled from 'styled-components';

import type { CapturedPieces } from '@/helpers/chess';
import type { Piece } from '@/helpers/fen';
import { PIECE_IMAGES } from '@/helpers/pieceImages';

const CapturedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const CapturedHeading = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text.muted};
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
  color: ${({ theme, $tone }) => ($tone === 'light' ? theme.text.primary : theme.text.secondary)};
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

const CapturedSideRow = ({ label, tone, pieces, capturedBy }: CapturedRowProps) => (
  <CapturedRow aria-label={`Pieces captured by ${label}`}>
    <SideLabel $tone={tone}>{label}</SideLabel>
    <PieceStrip>
      {pieces.map((piece, index) => (
        <CapturedPiece
          key={`${capturedBy}-${piece}-${index}`}
          src={PIECE_IMAGES[toPieceImage(piece, capturedBy)]}
          alt=""
          draggable={false}
        />
      ))}
    </PieceStrip>
  </CapturedRow>
);

const CapturedPiecesDisplay = ({ captured }: CapturedPiecesProps) => {
  if (!hasCapturedPieces(captured)) {
    return null;
  }

  return (
    <CapturedSection aria-label="Captured pieces">
      <CapturedHeading>Captured</CapturedHeading>
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
    </CapturedSection>
  );
};

export default CapturedPiecesDisplay;
