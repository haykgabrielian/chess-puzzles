import {
  type TransitionEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { BoardMove } from "@/helpers/chess";
import type { Piece } from "@/helpers/fen";
import {
  type BoardOrientation,
  buildMoveAnimation,
  DEFAULT_MOVE_ANIMATION_POLICY,
  getMoveAnimationKey,
  MOVE_ANIMATION_MS,
  type MoveAnimationPolicy,
  type MoveAnimationSpec,
  type MoveUpdateIntent,
  shouldAnimateMoveUpdate,
} from "@/helpers/moveAnimation";

const REDUCED_MOTION_MEDIA = "(prefers-reduced-motion: reduce)";
const EMPTY_HIDDEN_SQUARES: ReadonlySet<string> = new Set();
const ANIMATION_FALLBACK_MS = MOVE_ANIMATION_MS + 100;

type AnimatingMove = {
  key: string;
  spec: MoveAnimationSpec;
  active: boolean;
};

type UseMoveAnimationParams = {
  lastMove: BoardMove | null;
  fen: string;
  board: (Piece | null)[][];
  orientation: BoardOrientation;
  animateMoves: boolean;
  moveUpdateIntent?: MoveUpdateIntent;
  moveAnimationPolicy?: MoveAnimationPolicy;
};

const prefersReducedMotion = () =>
  window.matchMedia(REDUCED_MOTION_MEDIA).matches;

export const useMoveAnimation = ({
  lastMove,
  fen,
  board,
  orientation,
  animateMoves,
  moveUpdateIntent = "forward",
  moveAnimationPolicy = DEFAULT_MOVE_ANIMATION_POLICY,
}: UseMoveAnimationParams) => {
  const pendingTransitionsRef = useRef(0);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startFrameRef = useRef<number | null>(null);

  const [animatingMove, setAnimatingMove] = useState<AnimatingMove | null>(
    null,
  );
  const [processedMoveKey, setProcessedMoveKey] = useState<string | null>(
    null,
  );
  const [skipNext, setSkipNext] = useState(false);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const clearStartFrame = useCallback(() => {
    if (startFrameRef.current !== null) {
      cancelAnimationFrame(startFrameRef.current);
      startFrameRef.current = null;
    }
  }, []);

  const finishAnimation = useCallback(
    (key: string) => {
      clearFallbackTimer();
      clearStartFrame();
      pendingTransitionsRef.current = 0;
      setProcessedMoveKey(key);
      setAnimatingMove(null);
    },
    [clearFallbackTimer, clearStartFrame],
  );

  const skipAnimation = useCallback(() => {
    setSkipNext(true);
  }, []);

  const moveKey = lastMove ? getMoveAnimationKey(fen, lastMove) : null;

  if (!moveKey) {
    if (processedMoveKey !== null) {
      setProcessedMoveKey(null);
    }
  } else if (
    moveKey !== processedMoveKey &&
    animatingMove?.key !== moveKey
  ) {
    if (skipNext) {
      setSkipNext(false);
      setProcessedMoveKey(moveKey);
    } else if (
      !animateMoves ||
      prefersReducedMotion() ||
      !shouldAnimateMoveUpdate(moveUpdateIntent, moveAnimationPolicy)
    ) {
      setProcessedMoveKey(moveKey);
    } else if (lastMove) {
      const spec = buildMoveAnimation(lastMove, board, orientation);

      if (!spec) {
        setProcessedMoveKey(moveKey);
      } else {
        setAnimatingMove({ key: moveKey, spec, active: false });
      }
    }
  }

  const visibleAnimatingMove =
    moveKey && animatingMove?.key === moveKey ? animatingMove : null;

  useLayoutEffect(() => {
    if (!visibleAnimatingMove || visibleAnimatingMove.active) {
      return;
    }

    pendingTransitionsRef.current = visibleAnimatingMove.spec.pieces.length;

    const firstFrame = requestAnimationFrame(() => {
      startFrameRef.current = requestAnimationFrame(() => {
        setAnimatingMove((current) =>
          current ? { ...current, active: true } : null,
        );
      });
    });

    startFrameRef.current = firstFrame;

    return clearStartFrame;
  }, [visibleAnimatingMove, clearStartFrame]);

  useLayoutEffect(() => {
    if (!visibleAnimatingMove?.active) {
      return;
    }

    fallbackTimerRef.current = setTimeout(() => {
      finishAnimation(visibleAnimatingMove.key);
    }, ANIMATION_FALLBACK_MS);

    return clearFallbackTimer;
  }, [visibleAnimatingMove, clearFallbackTimer, finishAnimation]);

  const onPieceTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform" || !visibleAnimatingMove?.active) {
        return;
      }

      pendingTransitionsRef.current -= 1;

      if (pendingTransitionsRef.current <= 0) {
        finishAnimation(visibleAnimatingMove.key);
      }
    },
    [visibleAnimatingMove, finishAnimation],
  );

  return {
    pieces: visibleAnimatingMove?.spec.pieces ?? null,
    isActive: visibleAnimatingMove?.active ?? false,
    hiddenSquares:
      visibleAnimatingMove?.spec.hiddenSquares ?? EMPTY_HIDDEN_SQUARES,
    onPieceTransitionEnd,
    skipAnimation,
  };
};
