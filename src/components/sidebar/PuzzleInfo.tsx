import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { PuzzleInfoIcon } from '@/components/ui/CardIcons';
import { usePuzzle } from '@/context/PuzzleContext';
import { usePuzzleGame } from '@/context/PuzzleGameContext';
import { addDays, canNavigateToNextDay } from '@/helpers/date';
import { createGame, getCheckmateWinner, type GameOutcome } from '@/helpers/chess';
import { getSideLabel } from '@/helpers/fen';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
  min-height: 100%;
`;

const PuzzleSummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const PuzzleSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const PuzzleTitle = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.4;
`;

const SolvedCount = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const SideToMove = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SuccessMessage = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const DrawMessage = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const Suggestion = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const getSolvedMessage = (
  gameOutcome: GameOutcome,
  fen: string,
): { title: string; detail: string | null } => {
  if (gameOutcome === 'checkmate') {
    return {
      title: 'Puzzle solved!',
      detail: `Checkmate — ${getCheckmateWinner(createGame(fen))} wins.`,
    };
  }

  if (gameOutcome === 'stalemate') {
    return {
      title: 'Puzzle solved!',
      detail: 'Stalemate — draw.',
    };
  }

  return { title: 'Puzzle solved!', detail: null };
};

const WrongMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.boardHighlight.danger};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'accent' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  flex: 1 1 auto;
  min-width: 0;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === 'danger' ? theme.boardHighlight.danger : theme.accent};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.boardHighlight.danger : theme.accent};
  background-color: transparent;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${({ $variant, theme }) =>
      $variant === 'danger' ? theme.boardHighlight.dangerMuted : theme.accentMuted};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PuzzleInfo = () => {
  const { puzzle, hasPuzzle, selectedDate, setSelectedDate } = usePuzzle();
  const { fen, status, gameOutcome, hasProgress, resetGame, retryMove } = usePuzzleGame();
  const sideToMove = `${getSideLabel(fen)} to move`;
  const solvedMessage = getSolvedMessage(gameOutcome, fen);
  const previousDay = addDays(selectedDate, -1);
  const nextDay = addDays(selectedDate, 1);
  const canGoNext = canNavigateToNextDay(selectedDate);

  return (
    <Card title="Puzzle Info" icon={<PuzzleInfoIcon />} collapsibleOnMobile>
      <Content>
        {hasPuzzle ? (
          <PuzzleSummaryRow>
            <PuzzleSummary>
              <PuzzleTitle>{puzzle.title}</PuzzleTitle>
              <SolvedCount>Solved by {puzzle.solved_count.toLocaleString()}</SolvedCount>
            </PuzzleSummary>
            {hasProgress && status === 'playing' && (
              <ActionButton type="button" onClick={resetGame}>
                Reset puzzle
              </ActionButton>
            )}
          </PuzzleSummaryRow>
        ) : (
          <PuzzleTitle>Today&apos;s puzzle isn&apos;t available yet</PuzzleTitle>
        )}

        {hasPuzzle && status === 'playing' && <SideToMove>{sideToMove}</SideToMove>}

        {hasPuzzle && status === 'wrong' && (
          <StatusBlock>
            <WrongMessage>Wrong move. Try again.</WrongMessage>
            <Actions>
              <ActionButton type="button" $variant="danger" onClick={retryMove}>
                Retry
              </ActionButton>
            </Actions>
          </StatusBlock>
        )}

        {hasPuzzle && status === 'solved' && (
          <StatusBlock>
            <SuccessMessage>{solvedMessage.title}</SuccessMessage>
            {solvedMessage.detail && <DrawMessage>{solvedMessage.detail}</DrawMessage>}
            <Suggestion>Try another puzzle:</Suggestion>
            <Actions>
              <ActionButton type="button" onClick={resetGame}>
                Reset puzzle
              </ActionButton>
              <ActionButton type="button" onClick={() => setSelectedDate(previousDay)}>
                ← Previous day
              </ActionButton>
              <ActionButton
                type="button"
                disabled={!canGoNext}
                onClick={() => setSelectedDate(nextDay)}
              >
                Next day →
              </ActionButton>
            </Actions>
          </StatusBlock>
        )}
      </Content>
    </Card>
  );
};

export default PuzzleInfo;
