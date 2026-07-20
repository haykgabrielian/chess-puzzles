import styled from "styled-components";

import Card from "@/components/ui/Card";
import { usePuzzle } from "@/context/PuzzleContext";
import { usePuzzleGame } from "@/context/PuzzleGameContext";
import {
  createGame,
  type GameOutcome,
  getCheckmateWinner,
} from "@/helpers/chess";
import { getSideLabel } from "@/helpers/fen";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
  min-height: 100%;
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

const WrongMessage = styled.p`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.boardHighlight.danger};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  flex: 1 1 auto;
  min-width: 0;
  border: 1px solid ${({ theme }) => theme.boardHighlight.danger};
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.boardHighlight.danger};
  background-color: transparent;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.boardHighlight.dangerMuted};
  }
`;

const getSolvedMessage = (
  gameOutcome: GameOutcome,
  fen: string,
): { title: string; detail: string | null } => {
  if (gameOutcome === "checkmate") {
    return {
      title: "Puzzle solved!",
      detail: `Checkmate — ${getCheckmateWinner(createGame(fen))} wins.`,
    };
  }

  if (gameOutcome === "stalemate") {
    return {
      title: "Puzzle solved!",
      detail: "Stalemate — draw.",
    };
  }

  return { title: "Puzzle solved!", detail: null };
};

const PuzzleInfo = () => {
  const { puzzle, hasPuzzle, isLoading } = usePuzzle();
  const { fen, status, gameOutcome, retryMove } = usePuzzleGame();
  const sideToMove = `${getSideLabel(fen)} to move`;
  const solvedMessage = getSolvedMessage(gameOutcome, fen);

  if (isLoading) {
    return (
      <Card title="Puzzle Info" collapsibleOnMobile>
        <Content>
          <PuzzleTitle>Loading puzzle…</PuzzleTitle>
        </Content>
      </Card>
    );
  }

  return (
    <Card title="Puzzle Info" collapsibleOnMobile>
      <Content>
        {hasPuzzle ? (
          <PuzzleSummary>
            <PuzzleTitle>{puzzle.title}</PuzzleTitle>
            <SolvedCount>
              Solved by {puzzle.solved_count.toLocaleString()}
            </SolvedCount>
          </PuzzleSummary>
        ) : (
          <PuzzleTitle>
            Today&apos;s puzzle isn&apos;t available yet
          </PuzzleTitle>
        )}

        {hasPuzzle && status === "playing" && (
          <SideToMove>{sideToMove}</SideToMove>
        )}

        {hasPuzzle && status === "wrong" && (
          <StatusBlock>
            <WrongMessage>Wrong move. Try again.</WrongMessage>
            <ActionButton type="button" onClick={retryMove}>
              Retry
            </ActionButton>
          </StatusBlock>
        )}

        {hasPuzzle && status === "solved" && (
          <StatusBlock>
            <SuccessMessage>{solvedMessage.title}</SuccessMessage>
            {solvedMessage.detail && (
              <DrawMessage>{solvedMessage.detail}</DrawMessage>
            )}
          </StatusBlock>
        )}
      </Content>
    </Card>
  );
};

export default PuzzleInfo;
