import styled, { keyframes, useTheme } from 'styled-components';
import { useContext, useMemo } from 'react';

import { BoardThemeContext } from '@/context/BoardThemeContext';
import { type BoardCoordinateMode, type BoardHighlight } from '@/helpers/boardThemes';
import type { BoardMove } from '@/helpers/chess';
import { parseFenBoard } from '@/helpers/fen';
import { PIECE_IMAGES } from '@/helpers/pieceImages';

const MOBILE = '@media (max-width: 900px)';

const BOARD_SIZE = 8;
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const BLACK_ORIENTED_RANKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type BoardOrientation = 'white' | 'black';

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
  onSquareClick?: (square: string) => void;
};

const solvedFlash = keyframes`
  0% {
    opacity: 0;
  }
  18% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
`;

const SolvedFlashOverlay = styled.span<{ $color: string }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  background-color: ${({ $color }) => $color};
  animation: ${solvedFlash} 1.1s ease-out forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0;
  }
`;

const BoardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
`;

const LABEL_SIZE = 24;

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
  border-radius: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? '8px' : '0')};
  box-sizing: border-box;
`;

const RankLabels = styled.div<{ $color: string; $bg: string }>`
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  align-items: center;
  justify-items: center;
  font-size: 0.75rem;
  font-weight: 500;
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
  font-size: 0.75rem;
  font-weight: 500;
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

const Grid = styled.div<{ $coordinateMode: BoardCoordinateMode }>`
  grid-column: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? 2 : 1)};
  grid-row: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? 2 : 1)};
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: ${({ $coordinateMode }) => ($coordinateMode !== 'aside' ? '1' : 'auto')};
  border: ${({ $coordinateMode, theme }) =>
    $coordinateMode === 'aside' ? `1px solid ${theme.border}` : 'none'};
  border-radius: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? '4px' : '0')};
  overflow: hidden;
`;

const Square = styled.button<{
  $isLight: boolean;
  $light: string;
  $dark: string;
  $overlayColor: string | null;
  $canInteract: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  aspect-ratio: 1;
  cursor: ${({ $canInteract }) => ($canInteract ? 'pointer' : 'default')};
  background-color: ${({ $isLight, $light, $dark }) => ($isLight ? $light : $dark)};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    background-color: ${({ $overlayColor }) => $overlayColor ?? 'transparent'};
    opacity: ${({ $overlayColor }) => ($overlayColor ? 1 : 0)};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
    outline-offset: -2px;
  }
`;

const LastMoveOverlay = styled.span<{ $color: string }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-color: ${({ $color }) => $color};
`;

const TargetDot = styled.span<{ $color: string }>`
  position: absolute;
  width: 22%;
  height: 22%;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  pointer-events: none;
  z-index: 2;
`;

const CaptureFrame = styled.span<{ $color: string }>`
  position: absolute;
  inset: 10%;
  border: 3px solid ${({ $color }) => $color};
  border-radius: 18%;
  pointer-events: none;
  z-index: 4;
  box-sizing: border-box;
`;

const SquareCoordinate = styled.span<{
  $isLight: boolean;
  $light: string;
  $dark: string;
  $position: 'top-left' | 'bottom-right';
}>`
  position: absolute;
  top: ${({ $position }) => ($position === 'top-left' ? '3px' : 'auto')};
  bottom: ${({ $position }) => ($position === 'bottom-right' ? '3px' : 'auto')};
  left: ${({ $position }) => ($position === 'top-left' ? '4px' : 'auto')};
  right: ${({ $position }) => ($position === 'bottom-right' ? '4px' : 'auto')};
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;
  color: ${({ $isLight, $light, $dark }) => ($isLight ? $dark : $light)};
  pointer-events: none;
  user-select: none;

  ${MOBILE} {
    font-size: 0.6875rem;
    top: ${({ $position }) => ($position === 'top-left' ? '2px' : 'auto')};
    bottom: ${({ $position }) => ($position === 'bottom-right' ? '2px' : 'auto')};
    left: ${({ $position }) => ($position === 'top-left' ? '3px' : 'auto')};
    right: ${({ $position }) => ($position === 'bottom-right' ? '3px' : 'auto')};
  }
`;

const PieceImage = styled.img`
  position: relative;
  z-index: 3;
  width: 88%;
  height: 88%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
`;

const getSquareHighlight = (
  squareId: string,
  selectedSquare: string | null,
  legalTargets: string[],
  hintSquares: BoardMove | null,
  wrongMoveSquares: BoardMove | null,
): 'none' | 'selected' | 'target' | 'hint' | 'wrong' => {
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

  if (legalTargets.includes(squareId)) {
    return 'target';
  }

  return 'none';
};

const getOverlayColor = (
  highlight: ReturnType<typeof getSquareHighlight>,
  boardHighlight: BoardHighlight,
  hintColor: string,
): string | null => {
  switch (highlight) {
    case 'selected':
      return boardHighlight.selected;
    case 'hint':
      return hintColor;
    case 'wrong':
      return boardHighlight.wrong;
    default:
      return null;
  }
};

const getMoveIndicatorColor = (
  isLight: boolean,
  boardHighlight: BoardHighlight,
  type: 'dot' | 'capture',
): string => {
  if (type === 'dot') {
    return isLight ? boardHighlight.moveDotOnLight : boardHighlight.moveDotOnDark;
  }

  return isLight ? boardHighlight.captureRingOnLight : boardHighlight.captureRingOnDark;
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
  onSquareClick,
}: ChessBoardProps) => {
  const appTheme = useTheme();
  const { boardTheme, coordinateMode, showMoveDots, showCaptureIndicator } =
    useContext(BoardThemeContext);
  const board = useMemo(() => parseFenBoard(fen), [fen]);

  const displayFiles = orientation === 'white' ? FILES : [...FILES].reverse();
  const displayRanks = orientation === 'white' ? RANKS : BLACK_ORIENTED_RANKS;

  const squares = useMemo(
    () =>
      displayRanks.flatMap((rank, displayRankIndex) =>
        displayFiles.map((file, displayFileIndex) => {
          const rankIndex = RANKS.indexOf(rank as (typeof RANKS)[number]);
          const fileIndex = FILES.indexOf(file as (typeof FILES)[number]);
          const id = `${file}${rank}`;

          return {
            id,
            file,
            rank,
            fileIndex,
            rankIndex,
            displayRankIndex,
            displayFileIndex,
            isLight: (rankIndex + fileIndex) % 2 === 0,
            piece: board[rankIndex]?.[fileIndex] ?? null,
          };
        }),
      ),
    [board, displayFiles, displayRanks],
  );

  const labelProps = { $color: boardTheme.coordinate, $bg: boardTheme.frame };
  const showAsideLabels = coordinateMode === 'aside';
  const showInsideLabels = coordinateMode === 'inside';

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
        >
          {squares.map(
            ({
              id,
              file,
              rank,
              displayRankIndex,
              displayFileIndex,
              isLight,
              piece,
            }) => {
              const isLegalTarget = legalTargets.includes(id);
              const isSelected = selectedSquare === id;
              const isLastMoveSquare =
                lastMove !== null && (id === lastMove.from || id === lastMove.to);
              const squareHighlight = getSquareHighlight(
                id,
                selectedSquare,
                legalTargets,
                hintSquares,
                wrongMoveSquares,
              );

              return (
              <Square
                key={id}
                type="button"
                $isLight={isLight}
                $light={boardTheme.light}
                $dark={boardTheme.dark}
                $overlayColor={getOverlayColor(
                  squareHighlight,
                  boardTheme.highlight,
                  appTheme.boardHighlight.hint,
                )}
                $canInteract={canInteract}
                role="gridcell"
                aria-label={id}
                aria-selected={isSelected}
                disabled={!canInteract}
                onClick={() => onSquareClick?.(id)}
              >
                {isLastMoveSquare && (
                  <LastMoveOverlay
                    aria-hidden="true"
                    $color={appTheme.boardHighlight.lastMove}
                  />
                )}
                {isLastMoveSquare && isSolved && (
                  <SolvedFlashOverlay
                    key={`${lastMove.from}-${lastMove.to}`}
                    aria-hidden="true"
                    $color={appTheme.accent}
                  />
                )}
                {showInsideLabels && displayFileIndex === 0 && (
                  <SquareCoordinate
                    $isLight={isLight}
                    $light={boardTheme.light}
                    $dark={boardTheme.dark}
                    $position="top-left"
                    aria-hidden="true"
                  >
                    {rank}
                  </SquareCoordinate>
                )}
                {showInsideLabels && displayRankIndex === 7 && (
                  <SquareCoordinate
                    $isLight={isLight}
                    $light={boardTheme.light}
                    $dark={boardTheme.dark}
                    $position="bottom-right"
                    aria-hidden="true"
                  >
                    {file}
                  </SquareCoordinate>
                )}
                {piece && (
                  <PieceImage
                    src={PIECE_IMAGES[piece]}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                  />
                )}
                {showCaptureIndicator && isLegalTarget && piece && (
                  <CaptureFrame
                    aria-hidden="true"
                    $color={getMoveIndicatorColor(isLight, boardTheme.highlight, 'capture')}
                  />
                )}
                {showMoveDots && isLegalTarget && !piece && (
                  <TargetDot
                    $color={getMoveIndicatorColor(isLight, boardTheme.highlight, 'dot')}
                  />
                )}
              </Square>
              );
            },
          )}
        </Grid>
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

export default ChessBoard;
