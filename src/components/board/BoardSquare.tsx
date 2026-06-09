import { memo, useContext } from "react";
import styled, { css, keyframes } from "styled-components";

import PromotionPicker from "@/components/board/PromotionPicker";
import {
  HintBadgeIcon,
  SolvedBadgeIcon,
  WrongBadgeIcon,
} from "@/components/board/SquareBadgeIcons";
import { PieceSetContext } from "@/context/PieceSetContext";
import {
  type BoardHighlight,
  type BoardTheme,
  getSquareBackground,
} from "@/helpers/boardThemes";
import type { PromotionPiece } from "@/helpers/chess";
import type { Piece } from "@/helpers/fen";

const MOBILE = "@media (max-width: 900px)";

const insideCoordinateTypography = css`
  font-size: 1rem;
  font-weight: 600;
  line-height: 1;

  ${MOBILE} {
    font-size: 0.8125rem;
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
  $squareBackground: string;
  $canInteract: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  aspect-ratio: 1;
  cursor: ${({ $canInteract }) => ($canInteract ? "pointer" : "default")};
  background: ${({ $squareBackground }) => $squareBackground};

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

const HighlightOverlay = styled.span<{ $color: string }>`
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

const CaptureFrame = styled.span<{ $color: string; $borderRadius: string }>`
  position: absolute;
  inset: 2%;
  border: 3px solid ${({ $color }) => $color};
  border-radius: ${({ $borderRadius }) => $borderRadius};
  pointer-events: none;
  z-index: 4;
  box-sizing: border-box;
`;

const SquareCoordinate = styled.span<{
  $isLight: boolean;
  $light: string;
  $dark: string;
  $position: "top-left" | "bottom-right";
}>`
  position: absolute;
  top: ${({ $position }) => ($position === "top-left" ? "3px" : "auto")};
  bottom: ${({ $position }) => ($position === "bottom-right" ? "3px" : "auto")};
  left: ${({ $position }) => ($position === "top-left" ? "4px" : "auto")};
  right: ${({ $position }) => ($position === "bottom-right" ? "4px" : "auto")};
  ${insideCoordinateTypography}
  color: ${({ $isLight, $light, $dark }) => ($isLight ? $dark : $light)};
  pointer-events: none;
  user-select: none;

  ${MOBILE} {
    top: ${({ $position }) => ($position === "top-left" ? "2px" : "auto")};
    bottom: ${({ $position }) =>
      $position === "bottom-right" ? "2px" : "auto"};
    left: ${({ $position }) => ($position === "top-left" ? "3px" : "auto")};
    right: ${({ $position }) =>
      $position === "bottom-right" ? "3px" : "auto"};
  }
`;

const PieceImage = styled.img<{ $isDragSource?: boolean; $hidden?: boolean }>`
  position: relative;
  z-index: 3;
  width: 88%;
  height: 88%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  opacity: ${({ $isDragSource, $hidden }) => {
    if ($hidden) {
      return 0;
    }

    return $isDragSource ? 0.35 : 1;
  }};
`;

export type SquareBadgeType = "hint" | "wrong" | "solved";

const SquareBadge = styled.span<{
  $type: SquareBadgeType;
  $accentColor: string;
}>`
  position: absolute;
  top: 3px;
  right: 3px;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.94);
  color: ${({ $type, $accentColor }) => {
    switch ($type) {
      case "hint":
        return "#c9a227";
      case "wrong":
        return "#b25f5f";
      case "solved":
        return $accentColor;
    }
  }};

  svg {
    width: 15px;
    height: 15px;
    display: block;
    flex-shrink: 0;
  }

  ${MOBILE} {
    top: 2px;
    right: 2px;
    width: 15px;
    height: 15px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export type SquareHighlight = "none" | "selected" | "target" | "hint" | "wrong";

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
  squareBadgeType: SquareBadgeType | null;
  boardTheme: BoardTheme;
  hintColor: string;
  lastMoveColor: string;
  accentColor: string;
  promotionPicker: {
    color: "w" | "b";
    onSelect: (piece: PromotionPiece) => void;
  } | null;
  isDragSource: boolean;
  hidePiece?: boolean;
};

const getOverlayColor = (
  highlight: SquareHighlight,
  boardHighlight: BoardHighlight,
  hintColor: string,
  isLight: boolean,
): string | null => {
  switch (highlight) {
    case "selected":
      return isLight
        ? boardHighlight.selectedOnLight
        : boardHighlight.selectedOnDark;
    case "hint":
      return hintColor;
    case "wrong":
      return boardHighlight.wrong;
    default:
      return null;
  }
};

const getMoveIndicatorColor = (
  isLight: boolean,
  boardHighlight: BoardHighlight,
  type: "dot" | "capture",
): string => {
  if (type === "dot") {
    return isLight
      ? boardHighlight.moveDotOnLight
      : boardHighlight.moveDotOnDark;
  }

  return isLight
    ? boardHighlight.captureRingOnLight
    : boardHighlight.captureRingOnDark;
};

const getCaptureFrameBorderRadius = (pieceSetId: string): string =>
  ["gotic", "newspaper"].includes(pieceSetId) ? "30%" : "50%";

const renderSquareBadgeIcon = (type: SquareBadgeType) => {
  switch (type) {
    case "hint":
      return <HintBadgeIcon />;
    case "wrong":
      return <WrongBadgeIcon />;
    case "solved":
      return <SolvedBadgeIcon />;
  }
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
  squareBadgeType,
  boardTheme,
  hintColor,
  lastMoveColor,
  accentColor,
  promotionPicker,
  isDragSource,
  hidePiece = false,
}: BoardSquareProps) {
  const { pieceSet } = useContext(PieceSetContext);
  const { id, file, rank, displayRankIndex, displayFileIndex, isLight, piece } =
    layout;
  const highlightColor = getOverlayColor(
    squareHighlight,
    boardTheme.highlight,
    hintColor,
    isLight,
  );

  return (
    <Square
      type="button"
      data-square={id}
      $squareBackground={getSquareBackground(boardTheme, isLight)}
      $canInteract={canInteract}
      role="gridcell"
      aria-label={id}
      aria-selected={isSelected}
      disabled={!canInteract}
    >
      {isLastMoveSquare && squareHighlight !== "wrong" && (
        <LastMoveOverlay aria-hidden="true" $color={lastMoveColor} />
      )}
      {highlightColor && (
        <HighlightOverlay aria-hidden="true" $color={highlightColor} />
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
          $hidden={hidePiece}
        />
      )}
      {showCaptureIndicator && isLegalTarget && piece && (
        <CaptureFrame
          aria-hidden="true"
          $color={getMoveIndicatorColor(
            isLight,
            boardTheme.highlight,
            "capture",
          )}
          $borderRadius={getCaptureFrameBorderRadius(pieceSet.id)}
        />
      )}
      {showMoveDots && isLegalTarget && !piece && (
        <TargetDot
          $color={getMoveIndicatorColor(isLight, boardTheme.highlight, "dot")}
        />
      )}
      {squareBadgeType && (
        <SquareBadge
          aria-hidden="true"
          $type={squareBadgeType}
          $accentColor={accentColor}
        >
          {renderSquareBadgeIcon(squareBadgeType)}
        </SquareBadge>
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
