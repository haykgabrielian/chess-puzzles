import styled from "styled-components";

import Card from "@/components/ui/Card";
import { usePuzzle } from "@/context/PuzzleContext";
import { usePuzzleGame } from "@/context/PuzzleGameContext";
import { addDays, canNavigateToNextDay } from "@/helpers/date";

const Buttons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  flex: 1 1 auto;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.accent};
  background-color: transparent;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.accentMuted};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PuzzleActions = () => {
  const { hasPuzzle, selectedDate, setSelectedDate } = usePuzzle();
  const { hasProgress, resetGame } = usePuzzleGame();
  const previousDay = addDays(selectedDate, -1);
  const nextDay = addDays(selectedDate, 1);
  const canGoNext = canNavigateToNextDay(selectedDate);

  if (!hasPuzzle) {
    return null;
  }

  return (
    <Card title="Actions" collapsibleOnMobile>
      <Buttons>
        <ActionButton
          type="button"
          onClick={resetGame}
          disabled={!hasProgress}
        >
          Reset puzzle
        </ActionButton>
        <ActionButton
          type="button"
          onClick={() => setSelectedDate(previousDay)}
        >
          ← Previous day
        </ActionButton>
        <ActionButton
          type="button"
          disabled={!canGoNext}
          onClick={() => setSelectedDate(nextDay)}
        >
          Next day →
        </ActionButton>
      </Buttons>
    </Card>
  );
};

export default PuzzleActions;
