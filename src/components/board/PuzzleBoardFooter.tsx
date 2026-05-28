import styled from 'styled-components';

import { usePuzzle } from '@/context/PuzzleContext';
import { usePuzzleGame } from '@/context/PuzzleGameContext';
import { addDays, canNavigateToNextDay } from '@/helpers/date';

const MOBILE = '@media (max-width: 900px)';

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  width: 100%;

  ${MOBILE} {
    align-items: stretch;
  }
`;

const SolvedFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px 12px;
  width: 100%;

  ${MOBILE} {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const SolvedHeader = styled.div`
  display: contents;

  ${MOBILE} {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    width: 100%;
  }
`;

const SolvedActions = styled.div`
  display: contents;

  ${MOBILE} {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    width: 100%;
  }
`;

const SuccessMessage = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

const Suggestion = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const WrongRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;

  ${MOBILE} {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const WrongMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.boardHighlight.danger};
  text-align: right;

  ${MOBILE} {
    text-align: left;
  }
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'accent' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  flex-shrink: 0;
  border: 1px solid
    ${({ $variant, theme }) =>
      $variant === 'danger' ? theme.boardHighlight.danger : theme.accent};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.boardHighlight.danger : theme.accent};
  background-color: transparent;
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ $variant, theme }) =>
      $variant === 'danger' ? theme.boardHighlight.dangerMuted : theme.accentMuted};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${MOBILE} {
    padding: 10px 16px;
    font-size: 0.875rem;
    width: 100%;
    justify-content: center;
  }
`;

const PuzzleBoardFooter = () => {
  const { selectedDate, setSelectedDate } = usePuzzle();
  const { status, retryMove, resetGame } = usePuzzleGame();

  if (status === 'wrong') {
    return (
      <Footer>
        <WrongRow>
          <WrongMessage>Wrong move. Try again.</WrongMessage>
          <ActionButton type="button" $variant="danger" onClick={retryMove}>
            Retry
          </ActionButton>
        </WrongRow>
      </Footer>
    );
  }

  if (status === 'solved') {
    const previousDay = addDays(selectedDate, -1);
    const nextDay = addDays(selectedDate, 1);
    const canGoNext = canNavigateToNextDay(selectedDate);

    return (
      <SolvedFooter>
        <SolvedHeader>
          <SuccessMessage>Puzzle solved!</SuccessMessage>
          <Suggestion>Try another puzzle:</Suggestion>
        </SolvedHeader>
        <SolvedActions>
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
        </SolvedActions>
      </SolvedFooter>
    );
  }

  return null;
};

export default PuzzleBoardFooter;
