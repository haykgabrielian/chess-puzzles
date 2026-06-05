import {
  type PointerEvent,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { css, useTheme } from 'styled-components';

import BoardSquare, {
  type BoardSquareLayout,
  type SquareHighlight,
} from '@/components/board/BoardSquare';
import { BoardThemeContext } from '@/context/BoardThemeContext';
import { PieceSetContext } from '@/context/PieceSetContext';
import { type BoardCoordinateMode } from '@/helpers/boardThemes';
import type { BoardMove, PromotionPiece } from '@/helpers/chess';
import { type Piece, getSideToMove, parseFenBoard } from '@/helpers/fen';

const MOBILE = '@media (max-width: 900px)';
const DRAG_THRESHOLD_PX = 8;

const asideCoordinateTypography = css`
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1;

  ${MOBILE} {
    font-size: 0.625rem;
  }
`;

const BOARD_SIZE = 8;
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const BLACK_ORIENTED_FILES = ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] as const;
const BLACK_ORIENTED_RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type BoardOrientation = 'white' | 'black';

type PromotionPickerState = {
  square: string;
  color: 'w' | 'b';
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
  onSquareClick?: (square: string) => void;
};

const BoardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
`;

const LABEL_SIZE = 22;
const BOARD_FRAME_BORDER_RADIUS = '8px';
const BOARD_GRID_BORDER_RADIUS = '4px';

const BoardFrame = styled.div<{
  $frame: string;
  $coordinateMode: BoardCoordinateMode;
}>`
  display: grid;
  grid-template-columns: ${({ $coordinateMode }) =>
    $coordinateMode === 'aside' ? `${LABEL_SIZE}px 1fr ${LABEL_SIZE}px` : '1fr'};
  grid-template-rows: ${({ $coordinateMode }) =>
    $coordinateMode === 'aside' ? `${LABEL_SIZE}px 1fr ${LABEL_SIZE}px` : '1fr'};
  gap: 4px;
  width: 100%;
  aspect-ratio: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? '1' : 'auto')};
  padding: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? '6px' : '0')};
  background-color: ${({ $frame, $coordinateMode }) =>
    $coordinateMode === 'aside' ? $frame : 'transparent'};
  border: ${({ $coordinateMode, theme }) =>
    $coordinateMode === 'aside' ? `1px solid ${theme.border}` : 'none'};
  border-radius: ${({ $coordinateMode }) =>
    $coordinateMode === 'aside' ? BOARD_FRAME_BORDER_RADIUS : '0'};
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
  grid-column: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? 2 : 1)};
  grid-row: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? 2 : 1)};
  position: relative;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: ${({ $coordinateMode }) => ($coordinateMode !== 'aside' ? '1' : 'auto')};
  border: ${({ $coordinateMode, theme }) =>
    $coordinateMode === 'aside' ? `1px solid ${theme.border}` : 'none'};
  border-radius: ${BOARD_GRID_BORDER_RADIUS};
  overflow: ${({ $allowOverflow }) => ($allowOverflow ? 'visible' : 'hidden')};
  touch-action: ${({ $isDragging }) => ($isDragging ? 'none' : 'manipulation')};
`;

const DragGhost = styled.img`
  position: fixed;
  z-index: 1000;
  width: min(12vw, 72px);
  height: min(12vw, 72px);
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
`;

const isPieceOfSideToMove = (piece: Piece, fen: string): boolean => {
  const sideToMove = getSideToMove(fen);
  const isWhitePiece = /[KQRBNP]/.test(piece);
  return (sideToMove === 'w' && isWhitePiece) || (sideToMove === 'b' && !isWhitePiece);
};

const getSquareFromPoint = (clientX: number, clientY: number): string | null => {
  const element = document.elementFromPoint(clientX, clientY);
  return element?.closest<HTMLElement>('[data-square]')?.dataset.square ?? null;
};

type PendingPointer = {
  square: string;
  piece: Piece | null;
  startX: number;
  startY: number;
};

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
    return 'wrong';
  }

  if (hintSquares && (squareId === hintSquares.from || squareId === hintSquares.to)) {
    return 'hint';
  }

  if (selectedSquare === squareId) {
    return 'selected';
  }

  if (legalTargetSet.has(squareId)) {
    return 'target';
  }

  return 'none';
};

const getDisplayAxes = (orientation: BoardOrientation) =>
  orientation === 'white'
    ? { displayFiles: FILES, displayRanks: RANKS }
    : { displayFiles: BLACK_ORIENTED_FILES, displayRanks: BLACK_ORIENTED_RANKS };

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
  orientation = 'white',
  selectedSquare = null,
  legalTargets = [],
  lastMove = null,
  hintSquares = null,
  wrongMoveSquares = null,
  canInteract = false,
  isSolved = false,
  promotionPicker = null,
  onSquareClick,
}: ChessBoardProps) => {
  const appTheme = useTheme();
  const { boardTheme, coordinateMode, showMoveDots, showCaptureIndicator } =
    useContext(BoardThemeContext);
  const { pieceSet } = useContext(PieceSetContext);
  const board = useMemo(() => parseFenBoard(fen), [fen]);
  const squareLayouts = useMemo(
    () => buildSquareLayouts(board, orientation),
    [board, orientation],
  );
  const legalTargetSet = useMemo(() => new Set(legalTargets), [legalTargets]);
  const { displayFiles, displayRanks } = getDisplayAxes(orientation);
  const pendingPointerRef = useRef<PendingPointer | null>(null);
  const dragActiveRef = useRef(false);
  const [dragGhost, setDragGhost] = useState<{
    from: string;
    piece: Piece;
    x: number;
    y: number;
  } | null>(null);

  const getSquareFromEvent = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const squareId = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-square]',
    )?.dataset.square;

    return squareId ?? null;
  }, []);

  const handleGridPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!canInteract || !onSquareClick || promotionPicker) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      const squareId = getSquareFromEvent(event);

      if (!squareId) {
        return;
      }

      const layout = squareLayouts.find(square => square.id === squareId);

      dragActiveRef.current = false;
      pendingPointerRef.current = {
        square: squareId,
        piece: layout?.piece ?? null,
        startX: event.clientX,
        startY: event.clientY,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [canInteract, getSquareFromEvent, onSquareClick, promotionPicker, squareLayouts],
  );

  const handleGridPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
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
        setDragGhost({
          from: pending.square,
          piece: pending.piece,
          x: event.clientX,
          y: event.clientY,
        });
        return;
      }

      setDragGhost(previous =>
        previous
          ? { ...previous, x: event.clientX, y: event.clientY }
          : null,
      );
    },
    [canInteract, fen, onSquareClick, promotionPicker, selectedSquare],
  );

  const handleGridPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
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
          onSquareClick(targetSquare);
        }

        setDragGhost(null);
        return;
      }

      onSquareClick(pending.square);
    },
    [canInteract, onSquareClick],
  );

  const handleGridPointerCancel = useCallback(() => {
    pendingPointerRef.current = null;
    dragActiveRef.current = false;
    setDragGhost(null);
  }, []);

  const labelProps = { $color: appTheme.text.secondary, $bg: boardTheme.frame };
  const showAsideLabels = coordinateMode === 'aside';
  const showInsideLabels = coordinateMode === 'inside';
  const solvedFlashKey =
    isSolved && lastMove ? `${lastMove.from}-${lastMove.to}` : null;

  return (
    <BoardWrapper aria-label="Chess board">
      <BoardFrame $frame={boardTheme.frame} $coordinateMode={coordinateMode}>
        {showAsideLabels && (
          <>
            <FileLabelsTop aria-hidden="true" {...labelProps}>
              {displayFiles.map(file => (
                <span key={`top-${file}`}>{file}</span>
              ))}
            </FileLabelsTop>
            <RankLabelsLeft aria-hidden="true" {...labelProps}>
              {displayRanks.map(rank => (
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
          onPointerDown={handleGridPointerDown}
          onPointerMove={handleGridPointerMove}
          onPointerUp={handleGridPointerUp}
          onPointerCancel={handleGridPointerCancel}
        >
          {squareLayouts.map(layout => {
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
                boardTheme={boardTheme}
                hintColor={appTheme.boardHighlight.hint}
                lastMoveColor={appTheme.boardHighlight.lastMove}
                accentColor={appTheme.accent}
                promotionPicker={
                  promotionPicker?.square === id ? promotionPicker : null
                }
                isDragSource={dragGhost?.from === id}
              />
            );
          })}
        </Grid>
        {dragGhost && (
          <DragGhost
            src={pieceSet.images[dragGhost.piece]}
            alt=""
            aria-hidden="true"
            style={{ left: dragGhost.x, top: dragGhost.y }}
          />
        )}
        {showAsideLabels && (
          <>
            <RankLabelsRight aria-hidden="true" {...labelProps}>
              {displayRanks.map(rank => (
                <span key={`right-${rank}`}>{rank}</span>
              ))}
            </RankLabelsRight>
            <FileLabelsBottom aria-hidden="true" {...labelProps}>
              {displayFiles.map(file => (
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
