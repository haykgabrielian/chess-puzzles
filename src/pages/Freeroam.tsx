import type { Square } from "chess.js";
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import BoardSizer from "@/components/board/BoardSizer";
import ChessBoard from "@/components/board/ChessBoard";
import SolveConfetti from "@/components/board/SolveConfetti";
import GameFormatsModal from "@/components/freeroam/GameFormatsModal";
import BoardLayout from "@/components/layout/BoardLayout";
import FreeroamActions from "@/components/sidebar/FreeroamActions";
import FreeroamInfo from "@/components/sidebar/FreeroamInfo";
import CapturedPiecesDisplay from "@/components/sidebar/CapturedPieces";
import MoveHistory from "@/components/sidebar/MoveHistory";
import {
  type BoardMove,
  createGame,
  type GameOutcome,
  getCapturedPieces,
  getFreeroamHistoryRows,
  getGameOutcome,
  getLegalTargetSquares,
  type HistoryRowKind,
  isPromotionMove,
  type PromotionPiece,
  replayGame,
  tryMove,
  type Variation,
} from "@/helpers/chess";
import { getSideToMove, STARTING_FEN } from "@/helpers/fen";
import {
  exportFreeroamPgn,
  type FreeroamImportResult,
  hasFreeroamProgress,
  type PgnGameInfo,
} from "@/helpers/gameImport";
import {
  type BoardAnimationMode,
  type BoardOrientation,
  createMoveAnimationRequest,
  type MoveAnimationRequest,
  type MoveUpdateIntent,
} from "@/helpers/moveAnimation";
import { playFreeroamMoveSound, playHistoryMoveSound } from "@/helpers/moveSound";

const KEY_CODE = {
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
} as const;

const Freeroam = () => {
  const gameRef = useRef(createGame(STARTING_FEN));
  const animationIdRef = useRef(0);
  const [moves, setMoves] = useState<string[]>([]);
  const [fenByPly, setFenByPly] = useState<string[]>([STARTING_FEN]);
  const [lastMoveByPly, setLastMoveByPly] = useState<(BoardMove | null)[]>([
    null,
  ]);
  const [variation, setVariation] = useState<Variation | null>(null);
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
  const [importSnapshot, setImportSnapshot] = useState<{
    pgn: string;
    fen: string;
  } | null>(null);
  const [pgnInfo, setPgnInfo] = useState<PgnGameInfo | null>(null);
  const [boardOrientation, setBoardOrientation] =
    useState<BoardOrientation>("white");

  // The "effective line" the user is currently navigating: the mainline up to
  // the variation's divergence point, followed by the variation moves. When no
  // variation is active these are just the mainline arrays. `positionIndex`
  // always indexes into the effective line.
  const effectiveMoves = useMemo(
    () =>
      variation
        ? [...moves.slice(0, variation.startPly), ...variation.moves]
        : moves,
    [moves, variation],
  );
  const effectiveFenByPly = useMemo(
    () =>
      variation
        ? [
            ...fenByPly.slice(0, variation.startPly + 1),
            ...variation.fenByPly.slice(1),
          ]
        : fenByPly,
    [fenByPly, variation],
  );
  const effectiveLastMoveByPly = useMemo(
    () =>
      variation
        ? [
            ...lastMoveByPly.slice(0, variation.startPly + 1),
            ...variation.lastMoveByPly.slice(1),
          ]
        : lastMoveByPly,
    [lastMoveByPly, variation],
  );

  const isAtMainlineLiveEnd = !variation && positionIndex === moves.length;

  const toggleBoardOrientation = useCallback(() => {
    setBoardOrientation((current) =>
      current === "white" ? "black" : "white",
    );
  }, []);

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

  const navigateTo = useCallback(
    (
      ply: number,
      fenArray: string[],
      lastMoveArray: (BoardMove | null)[],
      lineMoves: string[],
      lineLength: number,
      intent: MoveUpdateIntent,
    ) => {
      const nextFen = fenArray[ply] ?? STARTING_FEN;
      const nextLastMove = lastMoveArray[ply] ?? null;
      const game = createGame(nextFen);

      gameRef.current = game;
      setPositionIndex(ply);
      syncGameOutcome(game, ply === lineLength);
      commitBoardUpdate(
        game,
        nextLastMove,
        intent,
        nextLastMove ? "animate" : "none",
      );

      if (intent === "historyJump" && ply !== positionIndex) {
        playHistoryMoveSound(lineMoves, ply, fenArray[0] ?? STARTING_FEN);
      }
    },
    [commitBoardUpdate, positionIndex, syncGameOutcome],
  );

  // Jump to a mainline position. This is the explicit "return to the game"
  // action, so it discards any active variation (sub-history).
  const goToMainlinePly = useCallback(
    (ply: number) => {
      setVariation(null);
      navigateTo(ply, fenByPly, lastMoveByPly, moves, moves.length, "historyJump");
    },
    [fenByPly, lastMoveByPly, moves, navigateTo],
  );

  // Step along the current effective line (mainline prefix + variation),
  // keeping any active variation intact.
  const goToEffectivePly = useCallback(
    (ply: number) => {
      navigateTo(
        ply,
        effectiveFenByPly,
        effectiveLastMoveByPly,
        effectiveMoves,
        effectiveMoves.length,
        "historyJump",
      );
    },
    [effectiveFenByPly, effectiveLastMoveByPly, effectiveMoves, navigateTo],
  );

  const handleSelectPly = useCallback(
    (ply: number, kind: HistoryRowKind) => {
      if (kind === "variation") {
        goToEffectivePly(ply);
        return;
      }

      goToMainlinePly(ply);
    },
    [goToEffectivePly, goToMainlinePly],
  );

  const handleHistoryKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const { keyCode } = event;

    if (keyCode !== KEY_CODE.ARROW_LEFT && keyCode !== KEY_CODE.ARROW_RIGHT) {
      return;
    }

    if (keyCode === KEY_CODE.ARROW_LEFT && positionIndex > 0) {
      event.preventDefault();
      goToEffectivePly(positionIndex - 1);
      return;
    }

    if (
      keyCode === KEY_CODE.ARROW_RIGHT &&
      positionIndex < effectiveMoves.length
    ) {
      event.preventDefault();
      goToEffectivePly(positionIndex + 1);
    }
  });

  useEffect(() => {
    if (moves.length === 0) {
      return;
    }

    window.addEventListener("keydown", handleHistoryKeyDown);
    return () => window.removeEventListener("keydown", handleHistoryKeyDown);
  }, [moves.length]);

  const resetGame = useCallback(() => {
    gameRef.current = createGame(STARTING_FEN);
    setMoves([]);
    setFenByPly([STARTING_FEN]);
    setLastMoveByPly([null]);
    setVariation(null);
    setPositionIndex(0);
    setFen(STARTING_FEN);
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setAnimationRequest(null);
    setPendingPromotion(null);
    setGameOutcome("playing");
    setPgnInfo(null);
  }, []);

  const loadImportedGame = useCallback(
    (result: FreeroamImportResult) => {
      const finalPly = result.moves.length;
      const finalFen = result.fenByPly[finalPly] ?? result.startingFen;
      const finalLastMove = result.lastMoveByPly[finalPly] ?? null;
      const game = createGame(finalFen);

      gameRef.current = game;
      setMoves(result.moves);
      setFenByPly(result.fenByPly);
      setLastMoveByPly(result.lastMoveByPly);
      setVariation(null);
      setPositionIndex(finalPly);
      setSelectedSquare(null);
      setLegalTargets([]);
      setPendingPromotion(null);
      setAnimationRequest(null);
      setPgnInfo(result.pgnInfo ?? null);
      syncGameOutcome(game, true);
      commitBoardUpdate(game, finalLastMove, "forward", "none");
    },
    [commitBoardUpdate, syncGameOutcome],
  );

  const applyMove = useCallback(
    (
      from: string,
      to: string,
      promotion?: PromotionPiece,
      skipAnimation = false,
    ) => {
      const game = createGame(
        effectiveFenByPly[positionIndex] ?? STARTING_FEN,
      );
      const move = tryMove(game, from as Square, to as Square, promotion);

      if (!move) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      const nextFen = game.fen();
      const nextLastMove: BoardMove = { from: move.from, to: move.to };

      if (isAtMainlineLiveEnd) {
        // Extend the real game at its end.
        setMoves((previous) => [...previous, move.san]);
        setFenByPly((previous) => [
          ...previous.slice(0, positionIndex + 1),
          nextFen,
        ]);
        setLastMoveByPly((previous) => [
          ...previous.slice(0, positionIndex + 1),
          nextLastMove,
        ]);
      } else if (!variation || positionIndex <= variation.startPly) {
        // We're on a mainline position in the middle of the game (or before the
        // current variation's start): begin a brand-new sub-history branch.
        const startPly = positionIndex;
        const startFen = fenByPly[startPly] ?? STARTING_FEN;

        setVariation({
          startPly,
          moves: [move.san],
          fenByPly: [startFen, nextFen],
          lastMoveByPly: [null, nextLastMove],
        });
      } else {
        // We're inside the variation: extend it (truncating any forward moves
        // if we had stepped back into it).
        const depth = positionIndex - variation.startPly;

        setVariation({
          startPly: variation.startPly,
          moves: [...variation.moves.slice(0, depth), move.san],
          fenByPly: [...variation.fenByPly.slice(0, depth + 1), nextFen],
          lastMoveByPly: [
            ...variation.lastMoveByPly.slice(0, depth + 1),
            nextLastMove,
          ],
        });
      }

      gameRef.current = game;
      setPositionIndex(positionIndex + 1);
      syncGameOutcome(game, true);
      commitBoardUpdate(
        game,
        nextLastMove,
        "forward",
        skipAnimation ? "skip" : "animate",
      );
      playFreeroamMoveSound(move, game);
    },
    [
      commitBoardUpdate,
      effectiveFenByPly,
      fenByPly,
      isAtMainlineLiveEnd,
      positionIndex,
      syncGameOutcome,
      variation,
    ],
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

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalTargets([]);
  }, []);

  const onSquareClick = useCallback(
    (square: string, options?: { skipAnimation?: boolean }) => {
      if (gameOutcome !== "playing") {
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
      legalTargets,
      pendingPromotion,
      selectedSquare,
    ],
  );

  const promotionPicker = useMemo(
    () =>
      pendingPromotion
        ? {
            square: pendingPromotion.to,
            color: getSideToMove(fen),
            onSelect: onPromotionSelect,
          }
        : null,
    [fen, onPromotionSelect, pendingPromotion],
  );

  const startingFen = fenByPly[0] ?? STARTING_FEN;
  const hasProgress = hasFreeroamProgress(startingFen, moves);

  const openImport = useCallback(() => {
    const mainlinePly = variation
      ? variation.startPly
      : Math.min(positionIndex, moves.length);

    setImportSnapshot({
      pgn: exportFreeroamPgn(startingFen, moves.slice(0, mainlinePly), pgnInfo),
      fen: effectiveFenByPly[positionIndex] ?? fen,
    });
  }, [
    effectiveFenByPly,
    fen,
    moves,
    pgnInfo,
    positionIndex,
    startingFen,
    variation,
  ]);

  const closeImport = useCallback(() => {
    setImportSnapshot(null);
  }, []);

  const liveGame = useMemo(
    () => replayGame(moves, moves.length, startingFen),
    [moves, startingFen],
  );
  const isLiveGameOver = liveGame.isGameOver();

  const capturedPieces = useMemo(
    () =>
      getCapturedPieces(replayGame(effectiveMoves, positionIndex, startingFen)),
    [effectiveMoves, positionIndex, startingFen],
  );

  const moveHistoryRows = useMemo(
    () =>
      getFreeroamHistoryRows(moves, positionIndex, isLiveGameOver, variation),
    [isLiveGameOver, moves, positionIndex, variation],
  );

  // Show the end-of-game payoff (mate highlight + confetti) whenever we're at
  // the live end of the line currently being viewed — the mainline end or the
  // tip of an active variation.
  const isAtEffectiveLiveEnd = positionIndex === effectiveMoves.length;
  const liveGameOutcome = isAtEffectiveLiveEnd ? gameOutcome : "playing";
  const isCheckmate = liveGameOutcome === "checkmate";

  return (
    <>
      <BoardLayout
        boardLabel="Freeroam chess board"
        board={
          <BoardSizer>
            <ChessBoard
              fen={fen}
              orientation={boardOrientation}
              selectedSquare={selectedSquare}
              legalTargets={legalTargets}
              lastMove={lastMove}
              canInteract={gameOutcome === "playing"}
              isSolved={isCheckmate}
              promotionPicker={promotionPicker}
              animationRequest={animationRequest}
              onSquareClick={onSquareClick}
              onClearSelection={clearSelection}
            />
            <SolveConfetti
              isSolved={isCheckmate}
              lastMoveTo={lastMove?.to ?? null}
            />
          </BoardSizer>
        }
      >
        <FreeroamActions
          hasProgress={hasProgress}
          onImport={openImport}
          onReset={resetGame}
          onFlipBoard={toggleBoardOrientation}
        />
        <FreeroamInfo
          fen={fen}
          gameOutcome={liveGameOutcome}
          hasProgress={hasProgress}
          pgnInfo={pgnInfo}
        />
        <CapturedPiecesDisplay captured={capturedPieces} />
        <MoveHistory
          rows={moveHistoryRows}
          positionIndex={positionIndex}
          liveMoveCount={effectiveMoves.length}
          onSelectPly={handleSelectPly}
          onStep={goToEffectivePly}
        />
      </BoardLayout>
      {importSnapshot && (
        <GameFormatsModal
          currentPgn={importSnapshot.pgn}
          currentFen={importSnapshot.fen}
          pgnExportContext={{
            startingFen,
            moves,
            pgnInfo,
          }}
          onClose={closeImport}
          onApply={loadImportedGame}
        />
      )}
    </>
  );
};

export default Freeroam;
