import styled from 'styled-components';

import Card from '@/components/ui/Card';
import { usePuzzle } from '@/context/PuzzleContext';
import { usePuzzleGame } from '@/context/PuzzleGameContext';
import { formatHintSentence, isUserMoveIndex } from '@/helpers/chess';

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

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.accentMuted};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
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
  const { fen, isHintRevealed, moveIndex, revealHint, status } = usePuzzleGame();
  const isSolved = status === 'solved';

  const revealedHint =
    hasPuzzle && isHintRevealed && isUserMoveIndex(moveIndex)
      ? formatHintSentence(fen, puzzle.parsed.moves[moveIndex])
      : null;

  if (!hasPuzzle) {
    return null;
  }

  return (
    <Card title="Hint" bodyHeight={HINT_BODY_HEIGHT}>
      <HintBody>
        {isHintRevealed ? (
          <RevealedHint>{revealedHint}</RevealedHint>
        ) : (
          <ShowHintButton type="button" onClick={revealHint} disabled={isSolved}>
            <EyeIcon />
            Show Hint
          </ShowHintButton>
        )}
      </HintBody>
    </Card>
  );
};

export default Hint;
