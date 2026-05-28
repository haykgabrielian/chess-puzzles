import { useState } from 'react';
import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { HintIcon } from '@/components/ui/CardIcons';
import { usePuzzle } from '@/context/PuzzleContext';
import { usePuzzleGame } from '@/context/PuzzleGameContext';
import { formatHintSentence } from '@/helpers/chess';

const RevealedHint = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.5;
`;

const ShowHintButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.accent};
  background-color: transparent;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.accentMuted};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Hint = () => {
  const { puzzle, hasPuzzle, selectedDate } = usePuzzle();
  const { revealHint } = usePuzzleGame();
  const [revealedDate, setRevealedDate] = useState<string | null>(null);

  const dateKey = selectedDate.toISOString().slice(0, 10);
  const isRevealed = revealedDate === dateKey;

  const revealedHint = hasPuzzle
    ? formatHintSentence(puzzle.parsed.fen, puzzle.parsed.moves[0])
    : null;

  const handleRevealHint = () => {
    setRevealedDate(dateKey);
    revealHint();
  };

  return (
    <Card title="Hint" icon={<HintIcon />}>
      {!hasPuzzle ? (
        <RevealedHint>Check back later for today&apos;s puzzle.</RevealedHint>
      ) : isRevealed ? (
        <RevealedHint>{revealedHint}</RevealedHint>
      ) : (
        <ShowHintButton type="button" onClick={handleRevealHint}>
          <EyeIcon />
          Show Hint
        </ShowHintButton>
      )}
    </Card>
  );
};

export default Hint;
