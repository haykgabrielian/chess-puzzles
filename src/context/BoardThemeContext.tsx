import React from 'react';

import {
  type BoardCoordinateMode,
  type BoardTheme,
  defaultBoardCoordinateMode,
  defaultBoardThemeId,
  getBoardThemeById,
} from '@/helpers/boardThemes';

export const BoardThemeContext = React.createContext<{
  boardTheme: BoardTheme;
  setBoardThemeId: (id: string) => void;
  coordinateMode: BoardCoordinateMode;
  setCoordinateMode: (mode: BoardCoordinateMode) => void;
}>({
  boardTheme: getBoardThemeById(defaultBoardThemeId),
  setBoardThemeId: () => {},
  coordinateMode: defaultBoardCoordinateMode,
  setCoordinateMode: () => {},
});
