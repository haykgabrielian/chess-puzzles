import styled from "styled-components";

import Card from "@/components/ui/Card";
import type { GameOutcome } from "@/helpers/chess";
import { createGame, getCheckmateWinner } from "@/helpers/chess";
import { getSideLabel } from "@/helpers/fen";
import type { PgnGameInfo } from "@/helpers/gameImport";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GameSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const GameTitle = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.4;
`;

const MoveCount = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const PlayersLine = styled.span`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.4;
`;

const GameMeta = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 1.4;
`;

const SideToMove = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.accent};
`;

const GameOverMessage = styled.span`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${({ theme }) => theme.accent};
`;

type FreeroamInfoProps = {
  fen: string;
  gameOutcome: GameOutcome;
  hasProgress: boolean;
  pgnInfo: PgnGameInfo | null;
};

const formatPlayersLine = (pgnInfo: PgnGameInfo): string | null => {
  const { white, black } = pgnInfo;

  if (white && black) {
    return `${white} vs ${black}`;
  }

  return white ?? black ?? null;
};

const formatGameMeta = (pgnInfo: PgnGameInfo): string | null => {
  const parts = [
    pgnInfo.date,
    pgnInfo.site,
    pgnInfo.round ? `Round ${pgnInfo.round}` : undefined,
    pgnInfo.result,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : null;
};

const getGameOverMessage = (
  gameOutcome: GameOutcome,
  fen: string,
): string | null => {
  if (gameOutcome === "checkmate") {
    return `Checkmate! ${getCheckmateWinner(createGame(fen))} wins.`;
  }

  if (gameOutcome === "stalemate") {
    return "Stalemate — draw.";
  }

  return null;
};

const getFullMoveNumber = (fen: string): number => {
  const fullMove = Number(fen.split(" ")[5]);

  return Number.isFinite(fullMove) ? fullMove : 1;
};

const FreeroamInfo = ({
  fen,
  gameOutcome,
  hasProgress,
  pgnInfo,
}: FreeroamInfoProps) => {
  const fullMoveNumber = getFullMoveNumber(fen);
  const sideToMove = `${getSideLabel(fen)} to move`;
  const gameOverMessage = getGameOverMessage(gameOutcome, fen);
  const playersLine = pgnInfo ? formatPlayersLine(pgnInfo) : null;
  const gameMeta = pgnInfo ? formatGameMeta(pgnInfo) : null;

  return (
    <Card title="Game Info" collapsibleOnMobile>
      <Content>
        <GameSummary>
          <GameTitle>{pgnInfo?.event ?? "Freeroam"}</GameTitle>
          {playersLine && <PlayersLine>{playersLine}</PlayersLine>}
          {gameMeta && <GameMeta>{gameMeta}</GameMeta>}
          <MoveCount>
            {fullMoveNumber === 1 && !hasProgress
              ? "Starting position"
              : `Move ${fullMoveNumber}`}
          </MoveCount>
        </GameSummary>

        {gameOverMessage ? (
          <GameOverMessage>{gameOverMessage}</GameOverMessage>
        ) : (
          <SideToMove>{sideToMove}</SideToMove>
        )}
      </Content>
    </Card>
  );
};

export default FreeroamInfo;
