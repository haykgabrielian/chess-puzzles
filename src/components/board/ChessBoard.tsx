import {
  memo,
  type PointerEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled, { css, useTheme } from "styled-components";

import BoardAnnotations from "@/components/board/BoardAnnotations";
import BoardSquare, {
  type BoardSquareLayout,
  type SquareBadgeType,
  type SquareHighlight,
} from "@/components/board/BoardSquare";
import { BoardSettingsContext } from "@/context/BoardSettingsContext";
import { PieceSetContext } from "@/context/PieceSetContext";
import {
  type BoardArrow,
  buildDrawPreview,
  createArrowId,
  type DrawPreview,
  getArrowColorFromModifiers,
  toggleArrow,
} from "@/helpers/boardAnnotations";
import { type BoardCoordinateMode } from "@/helpers/boardThemes";
import type { BoardMove, PromotionPiece } from "@/helpers/chess";
import { getSideToMove, parseFenBoard, type Piece } from "@/helpers/fen";
import {
  MOVE_ANIMATION_MS,
  type MoveUpdateIntent,
} from "@/helpers/moveAnimation";
import { useMoveAnimation } from "@/hooks/useMoveAnimation";

const MOBILE = "@media (max-width: 900px)";
const DRAG_THRESHOLD_PX = 8;
const DRAW_THRESHOLD_PX = 4;
const PIECE_SIZE_RATIO = 0.88;

const asideCoordinateTypography = css`
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;

  ${MOBILE} {
    font-size: 0.625rem;
  }
`;

const BOARD_SIZE = 8;
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const BLACK_ORIENTED_FILES = ["h", "g", "f", "e", "d", "c", "b", "a"] as const;
const BLACK_ORIENTED_RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type BoardOrientation = "white" | "black";

type PromotionPickerState = {
  square: string;
  color: "w" | "b";
  onSelect: (piece: PromotionPiece) => void;
};

type ChessBoardProps = {
  fen: string;
  orientation?: BoardOrientation;
  selectedSquare?: string | null;
  legalTargets?: string[];
  lastMove?: BoardMove | null;
  hintSquares?: BoardMove | null;
  wrongMoveSquares?: BoardMove | null;
  canInteract?: boolean;
  isSolved?: boolean;
  promotionPicker?: PromotionPickerState | null;
  moveUpdateIntent?: MoveUpdateIntent;
  onSquareClick?: (square: string) => void;
  enableAnnotations?: boolean;
};

const BoardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
`;

const LABEL_SIZE = 22;
const BOARD_FRAME_BORDER_RADIUS = "8px";
const BOARD_GRID_BORDER_RADIUS = "4px";

const BoardFrame = styled.div<{
  $frame: string;
  $coordinateMode: BoardCoordinateMode;
}>`
  display: grid;
  grid-template-columns: ${({ $coordinateMode }) =>
    $coordinateMode === "aside"
      ? `${LABEL_SIZE}px 1fr ${LABEL_SIZE}px`
      : "1fr"};
  grid-template-rows: ${({ $coordinateMode }) =>
    $coordinateMode === "aside"
      ? `${LABEL_SIZE}px 1fr ${LABEL_SIZE}px`
      : "1fr"};
  gap: 4px;
  width: 100%;
  aspect-ratio: ${({ $coordinateMode }) =>
    $coordinateMode === "aside" ? "1" : "auto"};
  padding: ${({ $coordinateMode }) =>
    $coordinateMode === "aside" ? "6px" : "0"};
  background-color: ${({ $frame, $coordinateMode }) =>
    $coordinateMode === "aside" ? $frame : "transparent"};
  border: ${({ $coordinateMode, theme }) =>
    $coordinateMode === "aside" ? `1px solid ${theme.border}` : "none"};
  border-radius: ${({ $coordinateMode }) =>
    $coordinateMode === "aside" ? BOARD_FRAME_BORDER_RADIUS : "0"};
  box-sizing: border-box;

  ${MOBILE} {
    border-left: none;
    border-right: none;
  }
`;

const RankLabels = styled.div<{ $color: string; $bg: string }>`
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  align-items: center;
  justify-items: center;
  ${asideCoordinateTypography}
  color: ${({ $color }) => $color};
  background-color: ${({ $bg }) => $bg};
`;

const RankLabelsLeft = styled(RankLabels)`
  grid-column: 1;
  grid-row: 2;
`;

const RankLabelsRight = styled(RankLabels)`
  grid-column: 3;
  grid-row: 2;
`;

const FileLabels = styled.div<{ $color: string; $bg: string }>`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  align-items: center;
  justify-items: center;
  ${asideCoordinateTypography}
  color: ${({ $color }) => $color};
  background-color: ${({ $bg }) => $bg};
`;

const FileLabelsTop = styled(FileLabels)`
  grid-column: 2;
  grid-row: 1;
`;

const FileLabelsBottom = styled(FileLabels)`
  grid-column: 2;
  grid-row: 3;
`;

const Grid = styled.div<{
  $coordinateMode: BoardCoordinateMode;
  $allowOverflow?: boolean;
  $isDragging?: boolean;
}>`
  grid-column: ${({ $coordinateMode }) =>
    $coordinateMode === "aside" ? 2 : 1};
  grid-row: ${({ $coordinateMode }) => ($coordinateMode === "aside" ? 2 : 1)};
  position: relative;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: ${({ $coordinateMode }) =>
    $coordinateMode !== "aside" ? "1" : "auto"};
  border: ${({ $coordinateMode, theme }) =>
    $coordinateMode === "aside" ? `1px solid ${theme.border}` : "none"};
  border-radius: ${BOARD_GRID_BORDER_RADIUS};
  overflow: ${({ $allowOverflow }) => ($allowOverflow ? "visible" : "hidden")};
  touch-action: ${({ $isDragging }) => ($isDragging ? "none" : "manipulation")};
`;

const DragGhost = styled.img<{ $size: number }>`
  position: fixed;
  z-index: 1000;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
`;

const FlyingPieceLayer = styled.div<{
  $fileIndex: number;
  $rankIndex: number;
  $deltaFile: number;
  $deltaRank: number;
  $active: boolean;
}>`
  position: absolute;
  left: ${({ $fileIndex }) => $fileIndex * 12.5}%;
  top: ${({ $rankIndex }) => $rankIndex * 12.5}%;
  width: 12.5%;
  height: 12.5%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 6;
  transform: translate(
    ${({ $active, $deltaFile }) => ($active ? $deltaFile * 100 : 0)}%,
    ${({ $active, $deltaRank }) => ($active ? $deltaRank * 100 : 0)}%
  );
  transition: ${({ $active }) =>
    $active ? `transform ${MOVE_ANIMATION_MS}ms ease-out` : "none"};
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FlyingPieceImage = styled.img`
  width: 88%;
  height: 88%;
  object-fit: contain;
  user-select: none;
`;

const isPieceOfSideToMove = (piece: Piece, fen: string): boolean => {
  const sideToMove = getSideToMove(fen);
  const isWhitePiece = /[KQRBNP]/.test(piece);
  return (
    (sideToMove === "w" && isWhitePiece) ||
    (sideToMove === "b" && !isWhitePiece)
  );
};

const getSquareFromPoint = (
  clientX: number,
  clientY: number,
): string | null => {
  const element = document.elementFromPoint(clientX, clientY);
  return element?.closest<HTMLElement>("[data-square]")?.dataset.square ?? null;
};

type PendingPointer = {
  square: string;
  piece: Piece | null;
  startX: number;
  startY: number;
};

type PendingDraw = {
  from: string;
  arrowColor: ReturnType<typeof getArrowColorFromModifiers>;
  startX: number;
  startY: number;
};

const isDrawPointer = (
  button: number,
  aKeyHeld: boolean,
): boolean => button === 2 || (aKeyHeld && button === 0);

const resolveSquareHighlight = (
  squareId: string,
  selectedSquare: string | null,
  legalTargetSet: ReadonlySet<string>,
  hintSquares: BoardMove | null,
  wrongMoveSquares: BoardMove | null,
): SquareHighlight => {
  if (
    wrongMoveSquares &&
    (squareId === wrongMoveSquares.from || squareId === wrongMoveSquares.to)
  ) {
    return "wrong";
  }

  if (
    hintSquares &&
    (squareId === hintSquares.from || squareId === hintSquares.to)
  ) {
    return "hint";
  }

  if (selectedSquare === squareId) {
    return "selected";
  }

  if (legalTargetSet.has(squareId)) {
    return "target";
  }

  return "none";
};

const resolveSquareBadgeType = (
  squareId: string,
  hintSquares: BoardMove | null,
  wrongMoveSquares: BoardMove | null,
  isSolved: boolean,
  lastMove: BoardMove | null,
): SquareBadgeType | null => {
  if (wrongMoveSquares?.to === squareId) {
    return "wrong";
  }

  if (hintSquares?.to === squareId) {
    return "hint";
  }

  if (isSolved && lastMove?.to === squareId) {
    return "solved";
  }

  return null;
};

const getDisplayAxes = (orientation: BoardOrientation) =>
  orientation === "white"
    ? { displayFiles: FILES, displayRanks: RANKS }
    : {
        displayFiles: BLACK_ORIENTED_FILES,
        displayRanks: BLACK_ORIENTED_RANKS,
      };

const buildSquareLayouts = (
  board: (Piece | null)[][],
  orientation: BoardOrientation,
): BoardSquareLayout[] => {
  const { displayFiles, displayRanks } = getDisplayAxes(orientation);

  return displayRanks.flatMap((rank, displayRankIndex) =>
    displayFiles.map((file, displayFileIndex) => {
      const rankIndex = RANKS.indexOf(rank);
      const fileIndex = FILES.indexOf(file);
      const id = `${file}${rank}`;

      return {
        id,
        file,
        rank,
        displayRankIndex,
        displayFileIndex,
        isLight: (rankIndex + fileIndex) % 2 === 0,
        piece: board[rankIndex]?.[fileIndex] ?? null,
      };
    }),
  );
};

const ChessBoard = ({
  fen,
  orientation = "white",
  selectedSquare = null,
  legalTargets = [],
  lastMove = null,
  hintSquares = null,
  wrongMoveSquares = null,
  canInteract = false,
  isSolved = false,
  promotionPicker = null,
  moveUpdateIntent = "forward",
  onSquareClick,
  enableAnnotations = true,
}: ChessBoardProps) => {
  const appTheme = useTheme();
  const {
    boardTheme,
    coordinateMode,
    showMoveDots,
    showCaptureIndicator,
    showSquareBadges,
    animateMoves,
  } = useContext(BoardSettingsContext);
  const { pieceSet } = useContext(PieceSetContext);
  const board = useMemo(() => parseFenBoard(fen), [fen]);
  const squareLayouts = useMemo(
    () => buildSquareLayouts(board, orientation),
    [board, orientation],
  );
  const legalTargetSet = useMemo(() => new Set(legalTargets), [legalTargets]);
  const { displayFiles, displayRanks } = getDisplayAxes(orientation);
  const pendingPointerRef = useRef<PendingPointer | null>(null);
  const pendingDrawRef = useRef<PendingDraw | null>(null);
  const dragActiveRef = useRef(false);
  const aKeyHeldRef = useRef(false);
  const [dragGhost, setDragGhost] = useState<{
    from: string;
    piece: Piece;
    x: number;
    y: number;
    size: number;
  } | null>(null);
  const [arrows, setArrows] = useState<BoardArrow[]>([]);
  const [drawPreview, setDrawPreview] = useState<DrawPreview | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "a" || event.key === "A") {
        aKeyHeldRef.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "a" || event.key === "A") {
        aKeyHeldRef.current = false;
      }
    };

    const handleBlur = () => {
      aKeyHeldRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const clearAnnotations = useCallback(() => {
    setArrows([]);
    setDrawPreview(null);
  }, []);

  useEffect(() => {
    clearAnnotations();
  }, [fen, clearAnnotations]);

  const {
    pieces: animatingPieces,
    isActive: isMoveAnimationActive,
    hiddenSquares,
    onPieceTransitionEnd,
    skipAnimation,
  } = useMoveAnimation({
    lastMove: lastMove ?? null,
    fen,
    board,
    orientation,
    animateMoves,
    moveUpdateIntent,
  });

  const getSquareFromEvent = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const squareId = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-square]",
      )?.dataset.square;

      return squareId ?? null;
    },
    [],
  );

  const finishDraw = useCallback(
    (pending: PendingDraw, toSquare: string, dragged: boolean) => {
      if (!dragged || pending.from === toSquare) {
        return;
      }

      const preview = buildDrawPreview(
        pending.from,
        toSquare,
        pending.arrowColor,
      );

      if (!preview) {
        return;
      }

      setArrows((current) =>
        toggleArrow(current, {
          id: createArrowId(),
          from: preview.from,
          to: preview.to,
          path: preview.path,
          color: preview.color,
        }),
      );
    },
    [],
  );

  const handleGridContextMenu = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (enableAnnotations) {
        event.preventDefault();
      }
    },
    [enableAnnotations],
  );

  const handleGridPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (promotionPicker) {
        return;
      }

      const squareId = getSquareFromEvent(event);

      if (!squareId) {
        return;
      }

      if (
        enableAnnotations &&
        isDrawPointer(event.button, aKeyHeldRef.current)
      ) {
        event.preventDefault();
        pendingDrawRef.current = {
          from: squareId,
          arrowColor: getArrowColorFromModifiers(event),
          startX: event.clientX,
          startY: event.clientY,
        };
        setDrawPreview(null);
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }

      if (event.button !== 0 || aKeyHeldRef.current) {
        return;
      }

      if (enableAnnotations) {
        clearAnnotations();
      }

      if (!canInteract || !onSquareClick) {
        return;
      }

      const layout = squareLayouts.find((square) => square.id === squareId);

      dragActiveRef.current = false;
      pendingPointerRef.current = {
        square: squareId,
        piece: layout?.piece ?? null,
        startX: event.clientX,
        startY: event.clientY,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [
      canInteract,
      clearAnnotations,
      enableAnnotations,
      getSquareFromEvent,
      onSquareClick,
      promotionPicker,
      squareLayouts,
    ],
  );

  const handleGridPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const pendingDraw = pendingDrawRef.current;

      if (pendingDraw && enableAnnotations) {
        const toSquare =
          getSquareFromPoint(event.clientX, event.clientY) ?? pendingDraw.from;

        setDrawPreview(
          buildDrawPreview(
            pendingDraw.from,
            toSquare,
            pendingDraw.arrowColor,
          ),
        );
        return;
      }

      const pending = pendingPointerRef.current;

      if (!pending || !canInteract || !onSquareClick) {
        return;
      }

      const distance = Math.hypot(
        event.clientX - pending.startX,
        event.clientY - pending.startY,
      );

      if (!dragActiveRef.current) {
        if (distance < DRAG_THRESHOLD_PX) {
          return;
        }

        if (
          !pending.piece ||
          !isPieceOfSideToMove(pending.piece, fen) ||
          promotionPicker
        ) {
          return;
        }

        dragActiveRef.current = true;
        if (selectedSquare !== pending.square) {
          onSquareClick(pending.square);
        }

        const squareElement = event.currentTarget.querySelector<HTMLElement>(
          `[data-square="${pending.square}"]`,
        );
        const squareSize = squareElement?.getBoundingClientRect().width ?? 0;
        const pieceSize = squareSize > 0 ? squareSize * PIECE_SIZE_RATIO : 0;

        setDragGhost({
          from: pending.square,
          piece: pending.piece,
          x: event.clientX,
          y: event.clientY,
          size: pieceSize,
        });
        return;
      }

      setDragGhost((previous) =>
        previous ? { ...previous, x: event.clientX, y: event.clientY } : null,
      );
    },
    [canInteract, enableAnnotations, fen, onSquareClick, promotionPicker, selectedSquare],
  );

  const handleGridPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const pendingDraw = pendingDrawRef.current;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (pendingDraw && enableAnnotations) {
        const toSquare =
          getSquareFromPoint(event.clientX, event.clientY) ?? pendingDraw.from;
        const dragged =
          Math.hypot(
            event.clientX - pendingDraw.startX,
            event.clientY - pendingDraw.startY,
          ) >= DRAW_THRESHOLD_PX;

        finishDraw(pendingDraw, toSquare, dragged);
        pendingDrawRef.current = null;
        setDrawPreview(null);
        return;
      }

      const pending = pendingPointerRef.current;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const wasDragging = dragActiveRef.current;
      pendingPointerRef.current = null;
      dragActiveRef.current = false;

      if (!pending || !canInteract || !onSquareClick) {
        setDragGhost(null);
        return;
      }

      if (wasDragging) {
        const targetSquare = getSquareFromPoint(event.clientX, event.clientY);

        if (targetSquare && targetSquare !== pending.square) {
          skipAnimation();
          onSquareClick(targetSquare);
        }

        setDragGhost(null);
        return;
      }

      onSquareClick(pending.square);
    },
    [canInteract, enableAnnotations, finishDraw, onSquareClick, skipAnimation],
  );

  const handleGridPointerCancel = useCallback(() => {
    pendingPointerRef.current = null;
    pendingDrawRef.current = null;
    dragActiveRef.current = false;
    setDragGhost(null);
    setDrawPreview(null);
  }, []);

  const labelProps = { $color: appTheme.text.secondary, $bg: boardTheme.frame };
  const showAsideLabels = coordinateMode === "aside";
  const showInsideLabels = coordinateMode === "inside";
  const solvedFlashKey =
    isSolved && lastMove ? `${lastMove.from}-${lastMove.to}` : null;

  return (
    <BoardWrapper aria-label="Chess board">
      <BoardFrame $frame={boardTheme.frame} $coordinateMode={coordinateMode}>
        {showAsideLabels && (
          <>
            <FileLabelsTop aria-hidden="true" {...labelProps}>
              {displayFiles.map((file) => (
                <span key={`top-${file}`}>{file}</span>
              ))}
            </FileLabelsTop>
            <RankLabelsLeft aria-hidden="true" {...labelProps}>
              {displayRanks.map((rank) => (
                <span key={`left-${rank}`}>{rank}</span>
              ))}
            </RankLabelsLeft>
          </>
        )}
        <Grid
          role="grid"
          aria-rowcount={BOARD_SIZE}
          aria-colcount={BOARD_SIZE}
          $coordinateMode={coordinateMode}
          $allowOverflow={Boolean(promotionPicker)}
          $isDragging={Boolean(dragGhost)}
          onContextMenu={handleGridContextMenu}
          onPointerDown={handleGridPointerDown}
          onPointerMove={handleGridPointerMove}
          onPointerUp={handleGridPointerUp}
          onPointerCancel={handleGridPointerCancel}
        >
          {squareLayouts.map((layout) => {
            const { id } = layout;
            const isLegalTarget = legalTargetSet.has(id);
            const isSelected = selectedSquare === id;
            const isLastMoveSquare =
              lastMove !== null && (id === lastMove.from || id === lastMove.to);
            const squareHighlight = resolveSquareHighlight(
              id,
              selectedSquare,
              legalTargetSet,
              hintSquares,
              wrongMoveSquares,
            );

            return (
              <BoardSquare
                key={id}
                layout={layout}
                squareHighlight={squareHighlight}
                isLegalTarget={isLegalTarget}
                isSelected={isSelected}
                isLastMoveSquare={isLastMoveSquare}
                showSolvedFlash={isLastMoveSquare && isSolved}
                solvedFlashKey={solvedFlashKey}
                canInteract={canInteract}
                showInsideLabels={showInsideLabels}
                showMoveDots={showMoveDots}
                showCaptureIndicator={showCaptureIndicator}
                squareBadgeType={
                  showSquareBadges
                    ? resolveSquareBadgeType(
                        id,
                        hintSquares,
                        wrongMoveSquares,
                        isSolved,
                        lastMove,
                      )
                    : null
                }
                boardTheme={boardTheme}
                hintColor={appTheme.boardHighlight.hint}
                lastMoveColor={appTheme.boardHighlight.lastMove}
                accentColor={appTheme.accent}
                promotionPicker={
                  promotionPicker?.square === id ? promotionPicker : null
                }
                isDragSource={dragGhost?.from === id}
                hidePiece={hiddenSquares.has(id)}
              />
            );
          })}
          {enableAnnotations && (
            <BoardAnnotations
              squareLayouts={squareLayouts}
              arrows={arrows}
              preview={drawPreview}
            />
          )}
          {animatingPieces?.map((piece) => (
            <FlyingPieceLayer
              key={piece.id}
              aria-hidden="true"
              $fileIndex={piece.fromFileIndex}
              $rankIndex={piece.fromRankIndex}
              $deltaFile={piece.deltaFile}
              $deltaRank={piece.deltaRank}
              $active={isMoveAnimationActive}
              onTransitionEnd={onPieceTransitionEnd}
            >
              <FlyingPieceImage
                src={pieceSet.images[piece.piece]}
                alt=""
                draggable={false}
              />
            </FlyingPieceLayer>
          ))}
        </Grid>
        {dragGhost && dragGhost.size > 0 && (
          <DragGhost
            src={pieceSet.images[dragGhost.piece]}
            alt=""
            aria-hidden="true"
            $size={dragGhost.size}
            style={{ left: dragGhost.x, top: dragGhost.y }}
          />
        )}
        {showAsideLabels && (
          <>
            <RankLabelsRight aria-hidden="true" {...labelProps}>
              {displayRanks.map((rank) => (
                <span key={`right-${rank}`}>{rank}</span>
              ))}
            </RankLabelsRight>
            <FileLabelsBottom aria-hidden="true" {...labelProps}>
              {displayFiles.map((file) => (
                <span key={`bottom-${file}`}>{file}</span>
              ))}
            </FileLabelsBottom>
          </>
        )}
      </BoardFrame>
    </BoardWrapper>
  );
};

export default memo(ChessBoard);
