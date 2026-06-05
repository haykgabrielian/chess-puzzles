import {
  type TransitionEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import type { BoardMove } from '@/helpers/chess';
import type { Piece } from '@/helpers/fen';
import {
  MOVE_ANIMATION_MS,
  type BoardOrientation,
  type MoveAnimationSpec,
  buildMoveAnimation,
  getMoveAnimationKey,
} from '@/helpers/moveAnimation';

const REDUCED_MOTION_MEDIA = '(prefers-reduced-motion: reduce)';
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
};

const prefersReducedMotion = () =>
  window.matchMedia(REDUCED_MOTION_MEDIA).matches;

export const useMoveAnimation = ({
  lastMove,
  fen,
  board,
  orientation,
  animateMoves,
}: UseMoveAnimationParams) => {
  const skipNextRef = useRef(false);
  const processedMoveKeyRef = useRef<string | null>(null);
  const animatingKeyRef = useRef<string | null>(null);
  const pendingTransitionsRef = useRef(0);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startFrameRef = useRef<number | null>(null);

  const [animatingMove, setAnimatingMove] = useState<AnimatingMove | null>(null);

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
      processedMoveKeyRef.current = key;
      animatingKeyRef.current = null;
      setAnimatingMove(null);
    },
    [clearFallbackTimer, clearStartFrame],
  );

  const skipAnimation = useCallback(() => {
    skipNextRef.current = true;
  }, []);

  const moveKey = lastMove ? getMoveAnimationKey(fen, lastMove) : null;

  useLayoutEffect(() => {
    if (!lastMove || !moveKey) {
      processedMoveKeyRef.current = null;
      animatingKeyRef.current = null;
      setAnimatingMove(null);
      return;
    }

    if (
      processedMoveKeyRef.current === moveKey ||
      animatingKeyRef.current === moveKey
    ) {
      return;
    }

    if (skipNextRef.current) {
      skipNextRef.current = false;
      finishAnimation(moveKey);
      return;
    }

    if (!animateMoves || prefersReducedMotion()) {
      finishAnimation(moveKey);
      return;
    }

    const spec = buildMoveAnimation(lastMove, board, orientation);

    if (!spec) {
      finishAnimation(moveKey);
      return;
    }

    pendingTransitionsRef.current = spec.pieces.length;
    animatingKeyRef.current = moveKey;
    setAnimatingMove({ key: moveKey, spec, active: false });
  }, [animateMoves, board, finishAnimation, lastMove, moveKey, orientation]);

  useLayoutEffect(() => {
    if (!animatingMove || animatingMove.active) {
      return;
    }

    const firstFrame = requestAnimationFrame(() => {
      startFrameRef.current = requestAnimationFrame(() => {
        setAnimatingMove(current =>
          current ? { ...current, active: true } : null,
        );
      });
    });

    startFrameRef.current = firstFrame;

    return clearStartFrame;
  }, [animatingMove, clearStartFrame]);

  useLayoutEffect(() => {
    if (!animatingMove?.active) {
      return;
    }

    fallbackTimerRef.current = setTimeout(() => {
      finishAnimation(animatingMove.key);
    }, ANIMATION_FALLBACK_MS);

    return clearFallbackTimer;
  }, [animatingMove, clearFallbackTimer, finishAnimation]);

  const onPieceTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== 'transform' || !animatingMove?.active) {
        return;
      }

      pendingTransitionsRef.current -= 1;

      if (pendingTransitionsRef.current <= 0) {
        finishAnimation(animatingMove.key);
      }
    },
    [animatingMove, finishAnimation],
  );

  return {
    pieces: animatingMove?.spec.pieces ?? null,
    isActive: animatingMove?.active ?? false,
    hiddenSquares: animatingMove?.spec.hiddenSquares ?? EMPTY_HIDDEN_SQUARES,
    onPieceTransitionEnd,
    skipAnimation,
  };
};
