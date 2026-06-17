import {
  type TransitionEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { Piece } from "@/helpers/fen";
import {
  type BoardOrientation,
  buildMoveAnimation,
  DEFAULT_MOVE_ANIMATION_POLICY,
  MOVE_ANIMATION_MS,
  type MoveAnimationPolicy,
  type MoveAnimationRequest,
  type MoveAnimationSpec,
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
  request: MoveAnimationRequest | null;
  board: (Piece | null)[][];
  orientation: BoardOrientation;
  animateMoves: boolean;
  moveAnimationPolicy?: MoveAnimationPolicy;
};

const prefersReducedMotion = () =>
  window.matchMedia(REDUCED_MOTION_MEDIA).matches;

export const useMoveAnimation = ({
  request,
  board,
  orientation,
  animateMoves,
  moveAnimationPolicy = DEFAULT_MOVE_ANIMATION_POLICY,
}: UseMoveAnimationParams) => {
  const pendingTransitionsRef = useRef(0);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startFrameRef = useRef<number | null>(null);

  const [handledRequestId, setHandledRequestId] = useState<number | null>(
    null,
  );
  const [animatingMove, setAnimatingMove] = useState<AnimatingMove | null>(
    null,
  );

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

  const finishAnimation = useCallback(() => {
    clearFallbackTimer();
    clearStartFrame();
    pendingTransitionsRef.current = 0;
    setAnimatingMove(null);
  }, [clearFallbackTimer, clearStartFrame]);

  const requestId = request?.id ?? null;

  if (requestId === null) {
    if (handledRequestId !== null) {
      setHandledRequestId(null);
      setAnimatingMove(null);
    }
  } else if (requestId !== handledRequestId && request) {
    const shouldPlay =
      request.behavior === "animate" &&
      animateMoves &&
      !prefersReducedMotion() &&
      shouldAnimateMoveUpdate(request.intent, moveAnimationPolicy);

    if (!shouldPlay) {
      setHandledRequestId(requestId);
      setAnimatingMove(null);
    } else {
      const spec = buildMoveAnimation(request.lastMove, board, orientation);

      if (!spec) {
        setHandledRequestId(requestId);
        setAnimatingMove(null);
      } else {
        setHandledRequestId(requestId);
        setAnimatingMove({ key: String(requestId), spec, active: false });
      }
    }
  }

  const visibleAnimatingMove =
    requestId !== null && animatingMove?.key === String(requestId)
      ? animatingMove
      : null;

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
      finishAnimation();
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
        finishAnimation();
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
  };
};
