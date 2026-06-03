import { memo, useContext } from 'react';
import styled, { css, keyframes } from 'styled-components';

import PromotionPicker from '@/components/board/PromotionPicker';
import { PieceSetContext } from '@/context/PieceSetContext';
import { type BoardHighlight, type BoardTheme } from '@/helpers/boardThemes';
import type { PromotionPiece } from '@/helpers/chess';
import type { Piece } from '@/helpers/fen';

const MOBILE = '@media (max-width: 900px)';

const insideCoordinateTypography = css`
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1;

  ${MOBILE} {
    font-size: 0.6875rem;
  }
`;

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
  ${insideCoordinateTypography}
  color: ${({ $isLight, $light, $dark }) => ($isLight ? $dark : $light)};
  pointer-events: none;
  user-select: none;

  ${MOBILE} {
    top: ${({ $position }) => ($position === 'top-left' ? '2px' : 'auto')};
    bottom: ${({ $position }) => ($position === 'bottom-right' ? '2px' : 'auto')};
    left: ${({ $position }) => ($position === 'top-left' ? '3px' : 'auto')};
    right: ${({ $position }) => ($position === 'bottom-right' ? '3px' : 'auto')};
  }
`;

const PieceImage = styled.img<{ $isDragSource?: boolean }>`
  position: relative;
  z-index: 3;
  width: 88%;
  height: 88%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  opacity: ${({ $isDragSource }) => ($isDragSource ? 0.35 : 1)};
  transition: opacity 0.1s ease;
`;

export type SquareHighlight = 'none' | 'selected' | 'target' | 'hint' | 'wrong';

export type BoardSquareLayout = {
  id: string;
  file: string;
  rank: number;
  displayRankIndex: number;
  displayFileIndex: number;
  isLight: boolean;
  piece: Piece | null;
};

type BoardSquareProps = {
  layout: BoardSquareLayout;
  squareHighlight: SquareHighlight;
  isLegalTarget: boolean;
  isSelected: boolean;
  isLastMoveSquare: boolean;
  showSolvedFlash: boolean;
  solvedFlashKey: string | null;
  canInteract: boolean;
  showInsideLabels: boolean;
  showMoveDots: boolean;
  showCaptureIndicator: boolean;
  boardTheme: BoardTheme;
  hintColor: string;
  lastMoveColor: string;
  accentColor: string;
  promotionPicker: {
    color: 'w' | 'b';
    onSelect: (piece: PromotionPiece) => void;
  } | null;
  isDragSource: boolean;
};

const getOverlayColor = (
  highlight: SquareHighlight,
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

const BoardSquare = memo(function BoardSquare({
  layout,
  squareHighlight,
  isLegalTarget,
  isSelected,
  isLastMoveSquare,
  showSolvedFlash,
  solvedFlashKey,
  canInteract,
  showInsideLabels,
  showMoveDots,
  showCaptureIndicator,
  boardTheme,
  hintColor,
  lastMoveColor,
  accentColor,
  promotionPicker,
  isDragSource,
}: BoardSquareProps) {
  const { pieceSet } = useContext(PieceSetContext);
  const { id, file, rank, displayRankIndex, displayFileIndex, isLight, piece } = layout;

  return (
    <Square
      type="button"
      data-square={id}
      $isLight={isLight}
      $light={boardTheme.light}
      $dark={boardTheme.dark}
      $overlayColor={getOverlayColor(squareHighlight, boardTheme.highlight, hintColor)}
      $canInteract={canInteract}
      role="gridcell"
      aria-label={id}
      aria-selected={isSelected}
      disabled={!canInteract}
    >
      {isLastMoveSquare && (
        <LastMoveOverlay aria-hidden="true" $color={lastMoveColor} />
      )}
      {showSolvedFlash && solvedFlashKey && (
        <SolvedFlashOverlay
          key={solvedFlashKey}
          aria-hidden="true"
          $color={accentColor}
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
          src={pieceSet.images[piece]}
          alt=""
          aria-hidden="true"
          draggable={false}
          $isDragSource={isDragSource}
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
      {promotionPicker && (
        <PromotionPicker
          opensDown={displayRankIndex === 0 || displayRankIndex === 7}
          color={promotionPicker.color}
          onSelect={promotionPicker.onSelect}
        />
      )}
    </Square>
  );
});

export default BoardSquare;
