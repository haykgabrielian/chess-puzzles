import { memo, useMemo } from "react";
import styled from "styled-components";

import type { BoardSquareLayout } from "@/components/board/BoardSquare";
import {
  ANNOTATION_COLORS,
  type BoardArrow,
  type BoardCircle,
  buildConnectedPolylinePoints,
  type DrawPreview,
  getSquareCenter,
  type SquarePoint,
} from "@/helpers/boardAnnotations";

const ARROW_MARKER_SIZE = 0.3;
const ARROW_MARKER_TIP = ARROW_MARKER_SIZE;
const ARROW_MARKER_REF_X = 0.02;

const AnnotationLayer = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 7;
  overflow: visible;
`;

type BoardAnnotationsProps = {
  squareLayouts: BoardSquareLayout[];
  arrows: BoardArrow[];
  circles: BoardCircle[];
  preview: DrawPreview | null;
};

const renderConnectedArrow = (
  points: SquarePoint[],
  color: string,
  key: string,
  markerId: string,
) => {
  const polylinePoints = buildConnectedPolylinePoints(points);

  if (!polylinePoints) {
    return null;
  }

  return (
    <polyline
      key={key}
      points={polylinePoints}
      fill="none"
      stroke={color}
      strokeWidth={0.14}
      strokeLinecap="butt"
      strokeLinejoin="round"
      markerEnd={`url(#${markerId})`}
    />
  );
};

const BoardAnnotations = ({
  squareLayouts,
  arrows,
  circles,
  preview,
}: BoardAnnotationsProps) => {
  const markerIds = useMemo(
    () => ({
      yellow: "board-arrow-yellow",
      red: "board-arrow-red",
      blue: "board-arrow-blue",
      green: "board-arrow-green",
    }),
    [],
  );

  const circleElements = circles.map((circle) => {
    const center = getSquareCenter(circle.square, squareLayouts);

    if (!center) {
      return null;
    }

    return (
      <circle
        key={circle.id}
        cx={center.x}
        cy={center.y}
        r={0.455}
        fill="none"
        stroke={ANNOTATION_COLORS[circle.color]}
        strokeWidth={0.05}
      />
    );
  });

  const arrowElements = arrows.map((arrow) => {
    const points = arrow.path
      .map((square) => getSquareCenter(square, squareLayouts))
      .filter((point): point is SquarePoint => point !== null);

    return renderConnectedArrow(
      points,
      ANNOTATION_COLORS[arrow.color],
      arrow.id,
      markerIds[arrow.color],
    );
  });

  const previewElements = preview
    ? (() => {
        const points = preview.path
          .map((square) => getSquareCenter(square, squareLayouts))
          .filter((point): point is SquarePoint => point !== null);

        return renderConnectedArrow(
          points,
          ANNOTATION_COLORS[preview.color],
          "preview",
          markerIds[preview.color],
        );
      })()
    : null;

  return (
    <AnnotationLayer
      viewBox="0 0 8 8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {(Object.keys(ANNOTATION_COLORS) as Array<keyof typeof ANNOTATION_COLORS>).map(
          (color) => (
            <marker
              key={color}
              id={markerIds[color]}
              markerWidth={ARROW_MARKER_SIZE}
              markerHeight={ARROW_MARKER_SIZE}
              refX={ARROW_MARKER_REF_X}
              refY={ARROW_MARKER_SIZE / 2}
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d={`M0,0 L0,${ARROW_MARKER_SIZE} L${ARROW_MARKER_TIP},${ARROW_MARKER_SIZE / 2} z`}
                fill={ANNOTATION_COLORS[color]}
              />
            </marker>
          ),
        )}
      </defs>
      {circleElements}
      {arrowElements}
      {previewElements}
    </AnnotationLayer>
  );
};

export default memo(BoardAnnotations);
