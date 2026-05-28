import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { HintIcon } from '@/components/ui/CardIcons';
import { usePuzzle } from '@/context/PuzzleContext';
import { usePuzzleGame } from '@/context/PuzzleGameContext';
import { formatHintSentence } from '@/helpers/chess';

const HINT_BODY_HEIGHT = '76px';

const HintBody = styled.div`
  display: flex;
  align-items: center;
  min-height: 100%;
`;

const RevealedHint = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.5;
`;

const ShowHintButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 8px 14px;
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
  const { puzzle, hasPuzzle } = usePuzzle();
  const { isHintRevealed, revealHint } = usePuzzleGame();

  const revealedHint = hasPuzzle
    ? formatHintSentence(puzzle.parsed.fen, puzzle.parsed.moves[0])
    : null;

  return (
    <Card title="Hint" icon={<HintIcon />} bodyHeight={HINT_BODY_HEIGHT}>
      <HintBody>
        {!hasPuzzle ? (
          <RevealedHint>Check back later for today&apos;s puzzle.</RevealedHint>
        ) : isHintRevealed ? (
          <RevealedHint>{revealedHint}</RevealedHint>
        ) : (
          <ShowHintButton type="button" onClick={revealHint}>
            <EyeIcon />
            Show Hint
          </ShowHintButton>
        )}
      </HintBody>
    </Card>
  );
};

export default Hint;
