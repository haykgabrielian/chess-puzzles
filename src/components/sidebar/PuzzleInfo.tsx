import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { PuzzleInfoIcon } from '@/components/ui/CardIcons';
import { usePuzzle } from '@/context/PuzzleContext';
import { usePuzzleGame } from '@/context/PuzzleGameContext';
import { getSideLabel } from '@/helpers/fen';

const PUZZLE_INFO_BODY_HEIGHT = '118px';

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

const SolvedMessage = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
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

const PuzzleInfo = () => {
  const { puzzle, hasPuzzle } = usePuzzle();
  const { fen, status, hasProgress, resetGame } = usePuzzleGame();
  const sideToMove = `${getSideLabel(fen)} to move`;

  return (
    <Card
      title="Puzzle Info"
      icon={<PuzzleInfoIcon />}
      bodyHeight={PUZZLE_INFO_BODY_HEIGHT}
      collapsibleOnMobile
    >
      <Content>
        {hasPuzzle ? (
          <PuzzleSummaryRow>
            <PuzzleSummary>
              <PuzzleTitle>{puzzle.title}</PuzzleTitle>
              <SolvedCount>Solved by {puzzle.solved_count.toLocaleString()}</SolvedCount>
            </PuzzleSummary>
            {hasProgress && (
              <ResetButton type="button" onClick={resetGame}>
                Reset puzzle
              </ResetButton>
            )}
          </PuzzleSummaryRow>
        ) : (
          <PuzzleTitle>Today&apos;s puzzle isn&apos;t available yet</PuzzleTitle>
        )}
        {hasPuzzle &&
          (status === 'solved' ? (
            <SolvedMessage>Solved</SolvedMessage>
          ) : (
            <SideToMove>{sideToMove}</SideToMove>
          ))}
      </Content>
    </Card>
  );
};

export default PuzzleInfo;
