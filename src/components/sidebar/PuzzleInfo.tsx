import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { PuzzleInfoIcon } from '@/components/ui/CardIcons';
import { usePuzzle } from '@/context/PuzzleContext';
import { usePuzzleGame } from '@/context/PuzzleGameContext';
import { getSideLabel } from '@/helpers/fen';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  align-self: flex-start;
  padding: 8px 14px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  background-color: transparent;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.button.hover};
  }
`;

const PuzzleInfo = () => {
  const { puzzle, hasPuzzle } = usePuzzle();
  const { fen, status, hasProgress, resetGame } = usePuzzleGame();
  const sideToMove = `${getSideLabel(fen)} to move`;

  return (
    <Card title="Puzzle Info" icon={<PuzzleInfoIcon />}>
      <Content>
        <PuzzleTitle>
          {hasPuzzle ? puzzle.title : "Today's puzzle isn't available yet"}
        </PuzzleTitle>
        {hasPuzzle && (
          <SolvedCount>Solved by {puzzle.solved_count.toLocaleString()}</SolvedCount>
        )}
        {status === 'solved' ? (
          <SolvedMessage>Solved</SolvedMessage>
        ) : (
          hasPuzzle && <SideToMove>{sideToMove}</SideToMove>
        )}
        {hasPuzzle && hasProgress && (
          <ResetButton type="button" onClick={resetGame}>
            Reset puzzle
          </ResetButton>
        )}
      </Content>
    </Card>
  );
};

export default PuzzleInfo;
