import styled from 'styled-components';

import CapturedPiecesDisplay from '@/components/sidebar/CapturedPieces';
import Card from '@/components/ui/Card';
import { FreeroamIcon } from '@/components/ui/CardIcons';
import type { CapturedPieces } from '@/helpers/chess';
import { STARTING_FEN, getSideLabel } from '@/helpers/fen';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GameSummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const GameSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const GameTitle = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.4;
`;

const MoveCount = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const SideToMove = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const CheckmateMessage = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.accent};
  background-color: transparent;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.accentMuted};
  }
`;

type FreeroamInfoProps = {
  fen: string;
  captured: CapturedPieces;
  isCheckmate: boolean;
  checkmateWinner: 'White' | 'Black' | null;
  onReset: () => void;
};

const getFullMoveNumber = (fen: string): number => {
  const fullMove = Number(fen.split(' ')[5]);

  return Number.isFinite(fullMove) ? fullMove : 1;
};

const FreeroamInfo = ({
  fen,
  captured,
  isCheckmate,
  checkmateWinner,
  onReset,
}: FreeroamInfoProps) => {
  const hasProgress = fen !== STARTING_FEN;
  const fullMoveNumber = getFullMoveNumber(fen);
  const sideToMove = `${getSideLabel(fen)} to move`;

  return (
    <Card title="Game Info" icon={<FreeroamIcon />} collapsibleOnMobile>
      <Content>
        <GameSummaryRow>
          <GameSummary>
            <GameTitle>Freeroam</GameTitle>
            <MoveCount>
              {fullMoveNumber === 1 && !hasProgress
                ? 'Starting position'
                : `Move ${fullMoveNumber}`}
            </MoveCount>
          </GameSummary>
          {hasProgress && (
            <ResetButton type="button" onClick={onReset}>
              New game
            </ResetButton>
          )}
        </GameSummaryRow>
        {isCheckmate && checkmateWinner ? (
          <CheckmateMessage>Checkmate! {checkmateWinner} wins.</CheckmateMessage>
        ) : (
          <SideToMove>{sideToMove}</SideToMove>
        )}
        <CapturedPiecesDisplay captured={captured} />
      </Content>
    </Card>
  );
};

export default FreeroamInfo;
