import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { PuzzleInfoIcon } from '@/components/ui/CardIcons';
import { usePuzzle } from '@/context/PuzzleContext';
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

const PuzzleInfo = () => {
  const { puzzle } = usePuzzle();
  const sideToMove = `${getSideLabel(puzzle.parsed.fen)} to move`;

  return (
    <Card title="Puzzle Info" icon={<PuzzleInfoIcon />}>
      <Content>
        <PuzzleTitle>{puzzle.title}</PuzzleTitle>
        <SolvedCount>Solved by {puzzle.solved_count.toLocaleString()}</SolvedCount>
        <SideToMove>{sideToMove}</SideToMove>
      </Content>
    </Card>
  );
};

export default PuzzleInfo;
