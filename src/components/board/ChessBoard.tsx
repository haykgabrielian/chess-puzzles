import styled from 'styled-components';
import { useContext, useMemo } from 'react';

import { BoardThemeContext } from '@/context/BoardThemeContext';
import { type BoardCoordinateMode } from '@/helpers/boardThemes';
import { parseFenBoard } from '@/helpers/fen';
import { PIECE_IMAGES } from '@/helpers/pieceImages';

const BOARD_SIZE = 8;
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1] as const;

type ChessBoardProps = {
  fen?: string;
};

const BoardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: min(100%, 720px);
`;

const LABEL_SIZE = 24;

const BoardFrame = styled.div<{
  $frame: string;
  $border: string;
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
  border: ${({ $border, $coordinateMode }) =>
    $coordinateMode === 'aside' ? `1px solid ${$border}` : 'none'};
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

const Grid = styled.div<{ $border: string; $coordinateMode: BoardCoordinateMode }>`
  grid-column: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? 2 : 1)};
  grid-row: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? 2 : 1)};
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: ${({ $coordinateMode }) => ($coordinateMode === 'inside' ? '1' : 'auto')};
  border: ${({ $border, $coordinateMode }) =>
    $coordinateMode === 'aside' ? `1px solid ${$border}` : 'none'};
  border-radius: ${({ $coordinateMode }) => ($coordinateMode === 'aside' ? '4px' : '0')};
  overflow: hidden;
`;

const Square = styled.div<{ $isLight: boolean; $light: string; $dark: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isLight, $light, $dark }) => ($isLight ? $light : $dark)};
  aspect-ratio: 1;
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
`;

const PieceImage = styled.img`
  width: 88%;
  height: 88%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
`;

const ChessBoard = ({ fen }: ChessBoardProps) => {
  const { boardTheme, coordinateMode } = useContext(BoardThemeContext);
  const board = useMemo(() => (fen ? parseFenBoard(fen) : null), [fen]);

  const squares = useMemo(
    () =>
      RANKS.flatMap((rank, rankIndex) =>
        FILES.map((file, fileIndex) => ({
          id: `${file}${rank}`,
          file,
          rank,
          fileIndex,
          rankIndex,
          isLight: (rankIndex + fileIndex) % 2 === 0,
          piece: board?.[rankIndex]?.[fileIndex] ?? null,
        })),
      ),
    [board],
  );

  const labelProps = { $color: boardTheme.coordinate, $bg: boardTheme.frame };
  const showAsideLabels = coordinateMode === 'aside';
  const showInsideLabels = coordinateMode === 'inside';

  return (
    <BoardWrapper aria-label="Chess board">
      <BoardFrame
        $frame={boardTheme.frame}
        $border={boardTheme.dark}
        $coordinateMode={coordinateMode}
      >
        {showAsideLabels && (
          <>
            <FileLabelsTop aria-hidden="true" {...labelProps}>
              {FILES.map(file => (
                <span key={`top-${file}`}>{file}</span>
              ))}
            </FileLabelsTop>
            <RankLabelsLeft aria-hidden="true" {...labelProps}>
              {RANKS.map(rank => (
                <span key={`left-${rank}`}>{rank}</span>
              ))}
            </RankLabelsLeft>
          </>
        )}
        <Grid
          role="grid"
          aria-rowcount={BOARD_SIZE}
          aria-colcount={BOARD_SIZE}
          $border={boardTheme.dark}
          $coordinateMode={coordinateMode}
        >
          {squares.map(({ id, file, rank, fileIndex, rankIndex, isLight, piece }) => (
            <Square
              key={id}
              $isLight={isLight}
              $light={boardTheme.light}
              $dark={boardTheme.dark}
              role="gridcell"
              aria-label={id}
            >
              {showInsideLabels && fileIndex === 0 && (
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
              {showInsideLabels && rankIndex === 7 && (
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
                <PieceImage src={PIECE_IMAGES[piece]} alt="" aria-hidden="true" draggable={false} />
              )}
            </Square>
          ))}
        </Grid>
        {showAsideLabels && (
          <>
            <RankLabelsRight aria-hidden="true" {...labelProps}>
              {RANKS.map(rank => (
                <span key={`right-${rank}`}>{rank}</span>
              ))}
            </RankLabelsRight>
            <FileLabelsBottom aria-hidden="true" {...labelProps}>
              {FILES.map(file => (
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
