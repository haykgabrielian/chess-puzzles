import React, { ReactNode, useState } from 'react';

import { BoardThemeContext } from '@/context/BoardThemeContext';
import {
  type BoardCoordinateMode,
  boardCoordinateModes,
  defaultBoardCoordinateMode,
  defaultBoardThemeId,
  getBoardThemeById,
} from '@/helpers/boardThemes';

const THEME_STORAGE_KEY = 'chess-board-theme';
const COORDINATE_MODE_STORAGE_KEY = 'chess-board-coordinate-mode';

const getInitialBoardThemeId = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved ?? defaultBoardThemeId;
};

const getInitialCoordinateMode = (): BoardCoordinateMode => {
  const saved = localStorage.getItem(COORDINATE_MODE_STORAGE_KEY);
  return boardCoordinateModes.some(mode => mode.id === saved)
    ? (saved as BoardCoordinateMode)
    : defaultBoardCoordinateMode;
};

const BoardThemeProvider = ({ children }: { children: ReactNode }) => {
  const [boardThemeId, setBoardThemeIdState] = useState(getInitialBoardThemeId);
  const [coordinateMode, setCoordinateModeState] = useState(getInitialCoordinateMode);

  const setBoardThemeId = (id: string) => {
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setBoardThemeIdState(id);
  };

  const setCoordinateMode = (mode: BoardCoordinateMode) => {
    localStorage.setItem(COORDINATE_MODE_STORAGE_KEY, mode);
    setCoordinateModeState(mode);
  };

  return (
    <BoardThemeContext.Provider
      value={{
        boardTheme: getBoardThemeById(boardThemeId),
        setBoardThemeId,
        coordinateMode,
        setCoordinateMode,
      }}
    >
      {children}
    </BoardThemeContext.Provider>
  );
};

export default BoardThemeProvider;
