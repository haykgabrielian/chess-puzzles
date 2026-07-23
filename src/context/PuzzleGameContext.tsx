import { Chess, type Square } from "chess.js";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePuzzle } from "@/context/PuzzleContext";
import {
  type BoardMove,
  createGame,
  type GameOutcome,
  getGameOutcome,
  getLegalTargetSquares,
  getMoveSquares,
  isPromotionMove,
  isUserMoveIndex,
  movesMatch,
  type PromotionPiece,
  tryMove,
  trySanMove,
} from "@/helpers/chess";
import { getSideToMove } from "@/helpers/fen";
import {
  type BoardAnimationMode,
  createMoveAnimationRequest,
  type MoveAnimationRequest,
  type MoveUpdateIntent,
} from "@/helpers/moveAnimation";
import {
  playAchievementSound,
  playIncorrectSound,
  playMoveSound,
} from "@/helpers/moveSound";

const OPPONENT_MOVE_DELAY_MS = 400;

export type PuzzleStatus = "idle" | "playing" | "wrong" | "solved";

type PuzzleGameContextValue = {
  fen: string;
  orientation: "white" | "black";
  selectedSquare: string | null;
  legalTargets: string[];
  lastMove: BoardMove | null;
  animationRequest: MoveAnimationRequest | null;
  hintSquares: BoardMove | null;
  isHintRevealed: boolean;
  moveIndex: number;
  wrongMoveSquares: BoardMove | null;
  status: PuzzleStatus;
  gameOutcome: GameOutcome;
  canInteract: boolean;
  hasProgress: boolean;
  pendingPromotion: BoardMove | null;
  onSquareClick: (square: string, options?: { skipAnimation?: boolean }) => void;
  onClearSelection: () => void;
  onPromotionSelect: (piece: PromotionPiece) => void;
  resetGame: () => void;
  retryMove: () => void;
  revealHint: () => void;
};

const PuzzleGameContext = createContext<PuzzleGameContextValue | null>(null);

export const usePuzzleGame = () => {
  const context = useContext(PuzzleGameContext);

  if (!context) {
    throw new Error("usePuzzleGame must be used within PuzzleGameProvider");
  }

  return context;
};

const PuzzleGameInner = ({ children }: { children: ReactNode }) => {
  const { puzzle, hasPuzzle } = usePuzzle();
  const gameRef = useRef(createGame(puzzle.parsed.fen));
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(0);
  const animationIdRef = useRef(0);

  const [fen, setFen] = useState(puzzle.parsed.fen);
  const [moveIndex, setMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<BoardMove | null>(null);
  const [animationRequest, setAnimationRequest] =
    useState<MoveAnimationRequest | null>(null);
  const [hintSquares, setHintSquares] = useState<BoardMove | null>(null);
  const [isHintRevealed, setIsHintRevealed] = useState(false);
  const [wrongMoveSquares, setWrongMoveSquares] = useState<BoardMove | null>(
    null,
  );
  const [pendingPromotion, setPendingPromotion] = useState<BoardMove | null>(
    null,
  );
  const [status, setStatus] = useState<PuzzleStatus>(
    hasPuzzle ? "playing" : "idle",
  );

  const clearTimers = useCallback(() => {
    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
      opponentTimerRef.current = null;
    }
  }, []);

  const commitBoardUpdate = useCallback(
    (
      game: Chess,
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

  const playOpponentMove = useCallback(
    (startIndex: number, solutionMoves: string[]) => {
      clearTimers();
      const session = sessionRef.current;

      opponentTimerRef.current = setTimeout(() => {
        if (session !== sessionRef.current) {
          return;
        }

        const game = gameRef.current;
        const expectedMove = solutionMoves[startIndex];
        const move = trySanMove(game, expectedMove);

        if (!move) {
          return;
        }

        const nextIndex = startIndex + 1;
        setMoveIndex(nextIndex);
        commitBoardUpdate(game, { from: move.from, to: move.to }, "forward", "animate");
        playMoveSound(move, game, false);

        if (nextIndex >= solutionMoves.length) {
          setStatus("solved");
          playAchievementSound();
        }
      }, OPPONENT_MOVE_DELAY_MS);
    },
    [clearTimers, commitBoardUpdate],
  );

  const clearHint = useCallback(() => {
    setHintSquares(null);
    setIsHintRevealed(false);
  }, []);

  const resetGame = useCallback(() => {
    clearTimers();
    sessionRef.current += 1;
    const startingFen = puzzle.parsed.fen;
    gameRef.current = createGame(startingFen);
    setMoveIndex(0);
    clearHint();
    setWrongMoveSquares(null);
    setPendingPromotion(null);
    setStatus(hasPuzzle ? "playing" : "idle");
    commitBoardUpdate(gameRef.current, null, "reset", "none");
  }, [clearHint, clearTimers, hasPuzzle, puzzle.parsed.fen, commitBoardUpdate]);

  const undoWrongMove = useCallback((): string => {
    const game = gameRef.current;
    game.undo();
    setWrongMoveSquares(null);
    setPendingPromotion(null);
    setStatus("playing");
    setSelectedSquare(null);
    setLegalTargets([]);
    setAnimationRequest(null);

    const history = game.history({ verbose: true });
    const previousMove = history.at(-1);
    const correctedFen = game.fen();

    setFen(correctedFen);
    setLastMove(
      previousMove ? { from: previousMove.from, to: previousMove.to } : null,
    );

    return correctedFen;
  }, []);

  const retryMove = useCallback(() => {
    if (status !== "wrong") {
      return;
    }

    undoWrongMove();
  }, [status, undoWrongMove]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const revealHint = useCallback(() => {
    if (
      !hasPuzzle ||
      puzzle.parsed.moves.length === 0 ||
      !isUserMoveIndex(moveIndex)
    ) {
      return;
    }

    const positionFen = status === "wrong" ? undoWrongMove() : fen;
    const expectedMove = puzzle.parsed.moves[moveIndex];

    setIsHintRevealed(true);
    setHintSquares(getMoveSquares(positionFen, expectedMove));
  }, [fen, hasPuzzle, moveIndex, puzzle.parsed.moves, status, undoWrongMove]);

  const applyUserMove = useCallback(
    (
      from: string,
      to: string,
      promotion?: PromotionPiece,
      skipAnimation = false,
    ) => {
      const game = gameRef.current;
      const solutionMoves = puzzle.parsed.moves;
      const expectedMove = solutionMoves[moveIndex];
      const move = tryMove(game, from as Square, to as Square, promotion);

      if (!move) {
        setSelectedSquare(null);
        setLegalTargets([]);
        return;
      }

      if (!movesMatch(move.san, expectedMove)) {
        clearHint();
        setWrongMoveSquares({ from: move.from, to: move.to });
        setStatus("wrong");
        commitBoardUpdate(
          game,
          { from: move.from, to: move.to },
          "forward",
          skipAnimation ? "skip" : "animate",
        );
        playIncorrectSound();
        return;
      }

      const nextIndex = moveIndex + 1;
      setMoveIndex(nextIndex);
      clearHint();
      commitBoardUpdate(
        game,
        { from: move.from, to: move.to },
        "forward",
        skipAnimation ? "skip" : "animate",
      );
      playMoveSound(move, game, true);

      if (nextIndex >= solutionMoves.length) {
        setStatus("solved");
        playAchievementSound();
        return;
      }

      if (!isUserMoveIndex(nextIndex)) {
        playOpponentMove(nextIndex, solutionMoves);
      }
    },
    [
      clearHint,
      moveIndex,
      playOpponentMove,
      puzzle.parsed.moves,
      commitBoardUpdate,
    ],
  );

  const onPromotionSelect = useCallback(
    (promotion: PromotionPiece) => {
      if (!pendingPromotion) {
        return;
      }

      const { from, to } = pendingPromotion;
      setPendingPromotion(null);
      applyUserMove(from, to, promotion);
    },
    [applyUserMove, pendingPromotion],
  );

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalTargets([]);
  }, []);

  const onSquareClick = useCallback(
    (square: string, options?: { skipAnimation?: boolean }) => {
      if (!hasPuzzle || status !== "playing" || !isUserMoveIndex(moveIndex)) {
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

        applyUserMove(
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
      applyUserMove,
      hasPuzzle,
      legalTargets,
      moveIndex,
      pendingPromotion,
      selectedSquare,
      status,
    ],
  );

  const orientation: "white" | "black" =
    getSideToMove(puzzle.parsed.fen) === "b" ? "black" : "white";
  const gameOutcome = useMemo(() => getGameOutcome(createGame(fen)), [fen]);
  const canInteract =
    hasPuzzle && status === "playing" && isUserMoveIndex(moveIndex);
  const hasProgress = moveIndex > 0 || fen !== puzzle.parsed.fen;

  const value = useMemo(
    () => ({
      fen,
      orientation,
      selectedSquare,
      legalTargets,
      lastMove,
      animationRequest,
      hintSquares,
      isHintRevealed,
      moveIndex,
      wrongMoveSquares,
      status,
      gameOutcome,
      canInteract,
      hasProgress,
      pendingPromotion,
      onSquareClick,
      onClearSelection: clearSelection,
      onPromotionSelect,
      resetGame,
      retryMove,
      revealHint,
    }),
    [
      canInteract,
      clearSelection,
      gameOutcome,
      hasProgress,
      fen,
      hintSquares,
      isHintRevealed,
      lastMove,
      animationRequest,
      moveIndex,
      legalTargets,
      onSquareClick,
      onPromotionSelect,
      orientation,
      pendingPromotion,
      resetGame,
      retryMove,
      revealHint,
      selectedSquare,
      status,
      wrongMoveSquares,
    ],
  );

  return (
    <PuzzleGameContext.Provider value={value}>
      {children}
    </PuzzleGameContext.Provider>
  );
};

const PuzzleGameProvider = ({ children }: { children: ReactNode }) => {
  const { puzzle, selectedDate } = usePuzzle();
  const gameKey = `${puzzle.id}-${selectedDate.toISOString()}`;

  return <PuzzleGameInner key={gameKey}>{children}</PuzzleGameInner>;
};

export default PuzzleGameProvider;
