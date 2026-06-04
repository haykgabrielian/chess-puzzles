import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Chess, type Square } from 'chess.js';

import { usePuzzle } from '@/context/PuzzleContext';
import { getSideToMove } from '@/helpers/fen';
import {
  type BoardMove,
  type PromotionPiece,
  createGame,
  getLegalTargetSquares,
  getMoveSquares,
  isPromotionMove,
  isUserMoveIndex,
  movesMatch,
  tryMove,
  trySanMove,
} from '@/helpers/chess';

const OPPONENT_MOVE_DELAY_MS = 350;

export type PuzzleStatus = 'idle' | 'playing' | 'wrong' | 'solved';

type PuzzleGameContextValue = {
  fen: string;
  orientation: 'white' | 'black';
  selectedSquare: string | null;
  legalTargets: string[];
  lastMove: BoardMove | null;
  hintSquares: BoardMove | null;
  isHintRevealed: boolean;
  moveIndex: number;
  wrongMoveSquares: BoardMove | null;
  status: PuzzleStatus;
  canInteract: boolean;
  hasProgress: boolean;
  pendingPromotion: BoardMove | null;
  onSquareClick: (square: string) => void;
  onPromotionSelect: (piece: PromotionPiece) => void;
  resetGame: () => void;
  retryMove: () => void;
  revealHint: () => void;
};

const PuzzleGameContext = createContext<PuzzleGameContextValue | null>(null);

export const usePuzzleGame = () => {
  const context = useContext(PuzzleGameContext);

  if (!context) {
    throw new Error('usePuzzleGame must be used within PuzzleGameProvider');
  }

  return context;
};

const PuzzleGameInner = ({ children }: { children: ReactNode }) => {
  const { puzzle, hasPuzzle } = usePuzzle();
  const gameRef = useRef(createGame(puzzle.parsed.fen));
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(0);

  const [fen, setFen] = useState(puzzle.parsed.fen);
  const [moveIndex, setMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<BoardMove | null>(null);
  const [hintSquares, setHintSquares] = useState<BoardMove | null>(null);
  const [isHintRevealed, setIsHintRevealed] = useState(false);
  const [wrongMoveSquares, setWrongMoveSquares] = useState<BoardMove | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<BoardMove | null>(null);
  const [status, setStatus] = useState<PuzzleStatus>(hasPuzzle ? 'playing' : 'idle');

  const clearTimers = useCallback(() => {
    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
      opponentTimerRef.current = null;
    }
  }, []);

  const syncBoardState = useCallback((game: Chess, move: BoardMove | null) => {
    setFen(game.fen());
    setLastMove(move);
    setSelectedSquare(null);
    setLegalTargets([]);
    setPendingPromotion(null);
  }, []);

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
        syncBoardState(game, { from: move.from, to: move.to });

        if (nextIndex >= solutionMoves.length) {
          setStatus('solved');
        }
      }, OPPONENT_MOVE_DELAY_MS);
    },
    [clearTimers, syncBoardState],
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
    setStatus(hasPuzzle ? 'playing' : 'idle');
    syncBoardState(gameRef.current, null);
  }, [clearHint, clearTimers, hasPuzzle, puzzle.parsed.fen, syncBoardState]);

  const retryMove = useCallback(() => {
    if (status !== 'wrong') {
      return;
    }

    const game = gameRef.current;
    game.undo();
    setWrongMoveSquares(null);
    setPendingPromotion(null);
    setStatus('playing');
    setFen(game.fen());
    setSelectedSquare(null);
    setLegalTargets([]);

    const history = game.history({ verbose: true });
    const previousMove = history.at(-1);

    setLastMove(
      previousMove ? { from: previousMove.from, to: previousMove.to } : null,
    );
  }, [status]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const revealHint = useCallback(() => {
    if (!hasPuzzle || puzzle.parsed.moves.length === 0 || !isUserMoveIndex(moveIndex)) {
      return;
    }

    const expectedMove = puzzle.parsed.moves[moveIndex];
    setIsHintRevealed(true);
    setHintSquares(getMoveSquares(fen, expectedMove));
  }, [fen, hasPuzzle, moveIndex, puzzle.parsed.moves]);

  const applyUserMove = useCallback(
    (from: string, to: string, promotion?: PromotionPiece) => {
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
        setWrongMoveSquares({ from: move.from, to: move.to });
        setStatus('wrong');
        syncBoardState(game, { from: move.from, to: move.to });
        return;
      }

      const nextIndex = moveIndex + 1;
      setMoveIndex(nextIndex);
      clearHint();
      syncBoardState(game, { from: move.from, to: move.to });

      if (nextIndex >= solutionMoves.length) {
        setStatus('solved');
        return;
      }

      if (!isUserMoveIndex(nextIndex)) {
        playOpponentMove(nextIndex, solutionMoves);
      }
    },
    [clearHint, moveIndex, playOpponentMove, puzzle.parsed.moves, syncBoardState],
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

  const onSquareClick = useCallback(
    (square: string) => {
      if (!hasPuzzle || status !== 'playing' || !isUserMoveIndex(moveIndex)) {
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

        applyUserMove(selectedSquare, square);
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

  const orientation: 'white' | 'black' =
    getSideToMove(puzzle.parsed.fen) === 'b' ? 'black' : 'white';
  const canInteract = hasPuzzle && status === 'playing' && isUserMoveIndex(moveIndex);
  const hasProgress = moveIndex > 0 || fen !== puzzle.parsed.fen;

  const value = useMemo(
    () => ({
      fen,
      orientation,
      selectedSquare,
      legalTargets,
      lastMove,
      hintSquares,
      isHintRevealed,
      moveIndex,
      wrongMoveSquares,
      status,
      canInteract,
      hasProgress,
      pendingPromotion,
      onSquareClick,
      onPromotionSelect,
      resetGame,
      retryMove,
      revealHint,
    }),
    [
      canInteract,
      hasProgress,
      fen,
      hintSquares,
      isHintRevealed,
      lastMove,
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

  return <PuzzleGameContext.Provider value={value}>{children}</PuzzleGameContext.Provider>;
};

const PuzzleGameProvider = ({ children }: { children: ReactNode }) => {
  const { puzzle, selectedDate } = usePuzzle();
  const gameKey = `${puzzle.id}-${selectedDate.toISOString()}`;

  return (
    <PuzzleGameInner key={gameKey}>
      {children}
    </PuzzleGameInner>
  );
};

export default PuzzleGameProvider;
