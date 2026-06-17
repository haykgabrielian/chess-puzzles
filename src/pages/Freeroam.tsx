import type { Square } from "chess.js";
import { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import BoardSizer from "@/components/board/BoardSizer";
import ChessBoard from "@/components/board/ChessBoard";
import SolveConfetti from "@/components/board/SolveConfetti";
import Header from "@/components/Header";
import FreeroamInfo from "@/components/sidebar/FreeroamInfo";
import MoveHistory from "@/components/sidebar/MoveHistory";
import {
  type BoardMove,
  createGame,
  type GameOutcome,
  getCapturedPieces,
  getGameOutcome,
  getLegalTargetSquares,
  getMoveHistoryRows,
  isPromotionMove,
  type PromotionPiece,
  replayGame,
  tryMove,
} from "@/helpers/chess";
import { getSideToMove, STARTING_FEN } from "@/helpers/fen";
import {
  type BoardAnimationMode,
  createMoveAnimationRequest,
  type MoveAnimationRequest,
  type MoveUpdateIntent,
} from "@/helpers/moveAnimation";

const MOBILE = "@media (max-width: 900px)";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.text.primary};
  overflow-x: clip;
`;

const Content = styled.main`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr min(440px, 40%);
  gap: 24px;
  padding: 24px 24px 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  align-items: start;

  ${MOBILE} {
    grid-template-columns: 1fr;
    align-items: start;
    gap: 16px;
    padding: 24px 0 0;
  }
`;

const BoardSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-width: 0;
  width: 100%;

  ${MOBILE} {
    justify-content: stretch;
  }
`;

const SidebarRoot = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;

  ${MOBILE} {
    padding: 0 12px;
    box-sizing: border-box;
  }
`;

const Freeroam = () => {
  const gameRef = useRef(createGame(STARTING_FEN));
  const animationIdRef = useRef(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [fenByPly, setFenByPly] = useState<string[]>([STARTING_FEN]);
  const [lastMoveByPly, setLastMoveByPly] = useState<(BoardMove | null)[]>([
    null,
  ]);
  const [positionIndex, setPositionIndex] = useState(0);
  const [fen, setFen] = useState(STARTING_FEN);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<BoardMove | null>(null);
  const [animationRequest, setAnimationRequest] =
    useState<MoveAnimationRequest | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<BoardMove | null>(
    null,
  );
  const [gameOutcome, setGameOutcome] = useState<GameOutcome>("playing");

  const isAtLivePosition = positionIndex === moves.length;

  const syncGameOutcome = useCallback(
    (game: ReturnType<typeof createGame>, atLiveEnd: boolean) => {
      if (!atLiveEnd) {
        setGameOutcome("playing");
        return;
      }

      setGameOutcome(getGameOutcome(game));
    },
    [],
  );

  const commitBoardUpdate = useCallback(
    (
      game: ReturnType<typeof createGame>,
      move: BoardMove | null,
      intent: MoveUpdateIntent = "forward",
      animation: BoardAnimationMode = "none",
    ) => {
      setFen(game.fen());
      setLastMove(move);
      setSelectedSquare(null);
      setLegalTargets([]);
      setPendingPromotion(null);

      if (!move || animation === "none") {
        setAnimationRequest(null);
        return;
      }

      setAnimationRequest(
        createMoveAnimationRequest(
          ++animationIdRef.current,
          move,
          game.fen(),
          intent,
          animation === "skip" ? "skip" : "animate",
        ),
      );
    },
    [],
  );

  const applyPly = useCallback(
    (ply: number, intent: MoveUpdateIntent, liveMoveCount = moves.length) => {
      const nextFen = fenByPly[ply] ?? STARTING_FEN;
      const nextLastMove = lastMoveByPly[ply] ?? null;
      const game = createGame(nextFen);

      gameRef.current = game;
      setPositionIndex(ply);
      syncGameOutcome(game, ply === liveMoveCount);
      commitBoardUpdate(
        game,
        nextLastMove,
        intent,
        nextLastMove ? "animate" : "none",
      );
    },
    [commitBoardUpdate, fenByPly, lastMoveByPly, moves.length, syncGameOutcome],
  );

  const goToPly = useCallback(
    (ply: number) => applyPly(ply, "historyJump"),
    [applyPly],
  );

  const resetGame = useCallback(() => {
    gameRef.current = createGame(STARTING_FEN);
    setMoves([]);
    setFenByPly([STARTING_FEN]);
    setLastMoveByPly([null]);
    setPositionIndex(0);
    setFen(STARTING_FEN);
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setAnimationRequest(null);
    setPendingPromotion(null);
    setGameOutcome("playing");
  }, []);

  const applyMove = useCallback(
    (
      from: string,
      to: string,
      promotion?: PromotionPiece,
      skipAnimation = false,
    ) => {
      const game = createGame(fenByPly[positionIndex] ?? STARTING_FEN);
      const move = tryMove(game, from as Square, to as Square, promotion);

      if (!move) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      const nextFen = game.fen();
      const nextLastMove: BoardMove = { from: move.from, to: move.to };
      const nextMoves = [...moves.slice(0, positionIndex), move.san];
      const nextPly = positionIndex + 1;

      gameRef.current = game;
      setMoves(nextMoves);
      setFenByPly((previous) => [
        ...previous.slice(0, positionIndex + 1),
        nextFen,
      ]);
      setLastMoveByPly((previous) => [
        ...previous.slice(0, positionIndex + 1),
        nextLastMove,
      ]);
      setPositionIndex(nextPly);
      syncGameOutcome(game, true);
      commitBoardUpdate(
        game,
        nextLastMove,
        "forward",
        skipAnimation ? "skip" : "animate",
      );
    },
    [commitBoardUpdate, fenByPly, moves, positionIndex, syncGameOutcome],
  );

  const onPromotionSelect = useCallback(
    (promotion: PromotionPiece) => {
      if (!pendingPromotion) {
        return;
      }

      const { from, to } = pendingPromotion;
      setPendingPromotion(null);
      applyMove(from, to, promotion);
    },
    [applyMove, pendingPromotion],
  );

  const onSquareClick = useCallback(
    (square: string, options?: { skipAnimation?: boolean }) => {
      if (!isAtLivePosition || gameOutcome !== "playing") {
        return;
      }

      const game = gameRef.current;

      if (pendingPromotion) {
        if (square === pendingPromotion.to) {
          return;
        }

        setPendingPromotion(null);
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      if (selectedSquare && legalTargets.includes(square)) {
        if (isPromotionMove(game, selectedSquare as Square, square as Square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        applyMove(
          selectedSquare,
          square,
          undefined,
          options?.skipAnimation,
        );
        return;
      }

      const piece = game.get(square as Square);

      if (!piece || piece.color !== game.turn()) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      setSelectedSquare(square);
      setLegalTargets(getLegalTargetSquares(game, square as Square));
    },
    [
      applyMove,
      gameOutcome,
      isAtLivePosition,
      legalTargets,
      pendingPromotion,
      selectedSquare,
    ],
  );

  const promotionPicker = useMemo(
    () =>
      pendingPromotion && isAtLivePosition
        ? {
            square: pendingPromotion.to,
            color: getSideToMove(fen),
            onSelect: onPromotionSelect,
          }
        : null,
    [fen, isAtLivePosition, onPromotionSelect, pendingPromotion],
  );

  const liveGame = useMemo(() => replayGame(moves, moves.length), [moves]);
  const isLiveGameOver = liveGame.isGameOver();

  const capturedPieces = useMemo(
    () => getCapturedPieces(replayGame(moves, positionIndex)),
    [moves, positionIndex],
  );

  const moveHistoryRows = useMemo(
    () => getMoveHistoryRows(moves, positionIndex, isLiveGameOver),
    [isLiveGameOver, moves, positionIndex],
  );

  const liveGameOutcome = isAtLivePosition ? gameOutcome : "playing";
  const isCheckmate = liveGameOutcome === "checkmate";

  return (
    <Page>
      <Header />
      <Content>
        <BoardSection aria-label="Freeroam chess board">
          <BoardSizer>
            <ChessBoard
              fen={fen}
              selectedSquare={selectedSquare}
              legalTargets={legalTargets}
              lastMove={lastMove}
              canInteract={isAtLivePosition && liveGameOutcome === "playing"}
              isSolved={isCheckmate}
              promotionPicker={promotionPicker}
              animationRequest={animationRequest}
              onSquareClick={onSquareClick}
            />
            <SolveConfetti
              isSolved={isCheckmate}
              lastMoveTo={lastMove?.to ?? null}
            />
          </BoardSizer>
        </BoardSection>
        <SidebarRoot aria-label="Freeroam sidebar">
          <FreeroamInfo
            fen={fen}
            captured={capturedPieces}
            gameOutcome={liveGameOutcome}
            onReset={resetGame}
          />
          <MoveHistory
            rows={moveHistoryRows}
            positionIndex={positionIndex}
            liveMoveCount={moves.length}
            onSelectPly={goToPly}
          />
        </SidebarRoot>
      </Content>
    </Page>
  );
};

export default Freeroam;
