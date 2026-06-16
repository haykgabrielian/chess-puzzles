export type AnnotationColor = "yellow" | "red" | "blue" | "green";

export type BoardArrow = {
  id: string;
  from: string;
  to: string;
  path: string[];
  color: AnnotationColor;
};

export type DrawPreview = {
  from: string;
  to: string;
  path: string[];
  color: AnnotationColor;
};

export const ANNOTATION_COLORS: Record<AnnotationColor, string> = {
  yellow: "rgba(235, 194, 0, 0.8)",
  red: "rgba(235, 60, 60, 0.8)",
  blue: "rgba(60, 120, 235, 0.8)",
  green: "rgba(60, 180, 75, 0.8)",
};

const ARROW_COLOR_BY_MODIFIERS = (
  shiftKey: boolean,
  ctrlKey: boolean,
  altKey: boolean,
): AnnotationColor => {
  if (ctrlKey) {
    return "red";
  }

  if (altKey) {
    return "blue";
  }

  if (shiftKey) {
    return "green";
  }

  return "yellow";
};

export const getArrowColorFromModifiers = (modifiers: {
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
}): AnnotationColor =>
  ARROW_COLOR_BY_MODIFIERS(
    modifiers.shiftKey,
    modifiers.ctrlKey,
    modifiers.altKey,
  );

export const createArrowId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

type SquareCoords = {
  file: number;
  rank: number;
};

const parseSquareCoords = (square: string): SquareCoords => ({
  file: square.charCodeAt(0) - "a".charCodeAt(0),
  rank: Number.parseInt(square[1], 10) - 1,
});

const toSquareId = ({ file, rank }: SquareCoords): string =>
  `${String.fromCharCode("a".charCodeAt(0) + file)}${rank + 1}`;

const isKnightMove = (fileDelta: number, rankDelta: number): boolean => {
  const absFile = Math.abs(fileDelta);
  const absRank = Math.abs(rankDelta);

  return (
    (absFile === 1 && absRank === 2) || (absFile === 2 && absRank === 1)
  );
};

export const buildShortestArrowPath = (from: string, to: string): string[] => {
  if (from === to) {
    return [from];
  }

  const start = parseSquareCoords(from);
  const end = parseSquareCoords(to);
  const fileDelta = end.file - start.file;
  const rankDelta = end.rank - start.rank;

  if (fileDelta === 0 || rankDelta === 0) {
    return [from, to];
  }

  if (Math.abs(fileDelta) === Math.abs(rankDelta)) {
    return [from, to];
  }

  if (!isKnightMove(fileDelta, rankDelta)) {
    return [from, to];
  }

  const rankFirstCorner = toSquareId({ file: start.file, rank: end.rank });
  const fileFirstCorner = toSquareId({ file: end.file, rank: start.rank });

  if (Math.abs(rankDelta) > Math.abs(fileDelta)) {
    return [from, rankFirstCorner, to];
  }

  return [from, fileFirstCorner, to];
};

export const buildDrawPreview = (
  from: string,
  to: string,
  color: AnnotationColor,
): DrawPreview | null => {
  if (from === to) {
    return null;
  }

  return {
    from,
    to,
    path: buildShortestArrowPath(from, to),
    color,
  };
};

export const arrowsMatch = (left: BoardArrow, right: BoardArrow): boolean =>
  left.from === right.from &&
  left.to === right.to &&
  left.color === right.color;

export const toggleArrow = (
  arrows: BoardArrow[],
  arrow: BoardArrow,
): BoardArrow[] => {
  const existing = arrows.find((candidate) => arrowsMatch(candidate, arrow));

  if (existing) {
    return arrows.filter((candidate) => candidate.id !== existing.id);
  }

  return [...arrows, arrow];
};

export type SquarePoint = {
  x: number;
  y: number;
};

export const getSquareCenter = (
  square: string,
  squareLayouts: ReadonlyArray<{ id: string; displayFileIndex: number; displayRankIndex: number }>,
): SquarePoint | null => {
  const layout = squareLayouts.find((entry) => entry.id === square);

  if (!layout) {
    return null;
  }

  return {
    x: layout.displayFileIndex + 0.5,
    y: layout.displayRankIndex + 0.5,
  };
};

const ARROW_START_MARGIN = 0.18;
const ARROW_END_MARGIN = 0.2;

type ShortenSegmentOptions = {
  startMargin?: number;
  endMargin?: number;
};

export const shortenSegment = (
  from: SquarePoint,
  to: SquarePoint,
  options: ShortenSegmentOptions = {},
): { from: SquarePoint; to: SquarePoint } => {
  const startMargin = options.startMargin ?? ARROW_START_MARGIN;
  const endMargin = options.endMargin ?? startMargin;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return { from, to };
  }

  const unitX = dx / length;
  const unitY = dy / length;
  const startShorten = Math.min(startMargin, length / 2 - 0.01);
  const endShorten = Math.min(endMargin, length / 2 - 0.01);

  return {
    from: {
      x: from.x + unitX * startShorten,
      y: from.y + unitY * startShorten,
    },
    to: {
      x: to.x - unitX * endShorten,
      y: to.y - unitY * endShorten,
    },
  };
};

export const buildConnectedPolylinePoints = (
  points: SquarePoint[],
): string | null => {
  if (points.length < 2) {
    return null;
  }

  if (points.length === 2) {
    const segment = shortenSegment(points[0], points[1], {
      startMargin: ARROW_START_MARGIN,
      endMargin: ARROW_END_MARGIN,
    });
    return `${segment.from.x},${segment.from.y} ${segment.to.x},${segment.to.y}`;
  }

  const firstSegment = shortenSegment(points[0], points[1], {
    startMargin: ARROW_START_MARGIN,
    endMargin: 0,
  });
  const lastSegment = shortenSegment(
    points[points.length - 2],
    points[points.length - 1],
    {
      startMargin: 0,
      endMargin: ARROW_END_MARGIN,
    },
  );
  const middlePoints = points.slice(1, -1);

  return [
    `${firstSegment.from.x},${firstSegment.from.y}`,
    ...middlePoints.map((point) => `${point.x},${point.y}`),
    `${lastSegment.to.x},${lastSegment.to.y}`,
  ].join(" ");
};
