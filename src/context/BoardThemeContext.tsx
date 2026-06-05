import React from 'react';

import {
  type BoardCoordinateMode,
  type BoardTheme,
  defaultBoardCoordinateMode,
  defaultBoardThemeId,
  defaultAnimateMoves,
  defaultShowCaptureIndicator,
  defaultShowMoveDots,
  getBoardThemeById,
} from '@/helpers/boardThemes';

export const BoardThemeContext = React.createContext<{
  boardTheme: BoardTheme;
  setBoardThemeId: (id: string) => void;
  coordinateMode: BoardCoordinateMode;
  setCoordinateMode: (mode: BoardCoordinateMode) => void;
  showMoveDots: boolean;
  setShowMoveDots: (enabled: boolean) => void;
  showCaptureIndicator: boolean;
  setShowCaptureIndicator: (enabled: boolean) => void;
  animateMoves: boolean;
  setAnimateMoves: (enabled: boolean) => void;
}>({
  boardTheme: getBoardThemeById(defaultBoardThemeId),
  setBoardThemeId: () => {},
  coordinateMode: defaultBoardCoordinateMode,
  setCoordinateMode: () => {},
  showMoveDots: defaultShowMoveDots,
  setShowMoveDots: () => {},
  showCaptureIndicator: defaultShowCaptureIndicator,
  setShowCaptureIndicator: () => {},
  animateMoves: defaultAnimateMoves,
  setAnimateMoves: () => {},
});
