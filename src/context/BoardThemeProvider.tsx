import React, { ReactNode, useState } from 'react';

import { BoardThemeContext } from '@/context/BoardThemeContext';
import {
  type BoardCoordinateMode,
  boardCoordinateModes,
  defaultBoardCoordinateMode,
  defaultBoardThemeId,
  defaultShowCaptureIndicator,
  defaultShowMoveDots,
  getBoardThemeById,
  resolveBoardThemeId,
} from '@/helpers/boardThemes';

const THEME_STORAGE_KEY = 'chess-board-theme';
const COORDINATE_MODE_STORAGE_KEY = 'chess-board-coordinate-mode';
const SHOW_MOVE_DOTS_STORAGE_KEY = 'chess-board-show-move-dots';
const SHOW_CAPTURE_INDICATOR_STORAGE_KEY = 'chess-board-show-capture-indicator';

const getInitialBoardThemeId = () => {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const id = resolveBoardThemeId(saved ?? defaultBoardThemeId);

  if (saved !== null && saved !== id) {
    localStorage.setItem(THEME_STORAGE_KEY, id);
  }

  return id;
};

const getInitialCoordinateMode = (): BoardCoordinateMode => {
  const saved = localStorage.getItem(COORDINATE_MODE_STORAGE_KEY);
  return boardCoordinateModes.some(mode => mode.id === saved)
    ? (saved as BoardCoordinateMode)
    : defaultBoardCoordinateMode;
};

const getInitialBooleanSetting = (key: string, defaultValue: boolean): boolean => {
  const saved = localStorage.getItem(key);

  if (saved === null) {
    return defaultValue;
  }

  return saved === 'true';
};

const BoardThemeProvider = ({ children }: { children: ReactNode }) => {
  const [boardThemeId, setBoardThemeIdState] = useState(getInitialBoardThemeId);
  const [coordinateMode, setCoordinateModeState] = useState(getInitialCoordinateMode);
  const [showMoveDots, setShowMoveDotsState] = useState(() =>
    getInitialBooleanSetting(SHOW_MOVE_DOTS_STORAGE_KEY, defaultShowMoveDots),
  );
  const [showCaptureIndicator, setShowCaptureIndicatorState] = useState(() =>
    getInitialBooleanSetting(SHOW_CAPTURE_INDICATOR_STORAGE_KEY, defaultShowCaptureIndicator),
  );

  const setBoardThemeId = (id: string) => {
    localStorage.setItem(THEME_STORAGE_KEY, id);
    setBoardThemeIdState(id);
  };

  const setCoordinateMode = (mode: BoardCoordinateMode) => {
    localStorage.setItem(COORDINATE_MODE_STORAGE_KEY, mode);
    setCoordinateModeState(mode);
  };

  const setShowMoveDots = (enabled: boolean) => {
    localStorage.setItem(SHOW_MOVE_DOTS_STORAGE_KEY, String(enabled));
    setShowMoveDotsState(enabled);
  };

  const setShowCaptureIndicator = (enabled: boolean) => {
    localStorage.setItem(SHOW_CAPTURE_INDICATOR_STORAGE_KEY, String(enabled));
    setShowCaptureIndicatorState(enabled);
  };

  return (
    <BoardThemeContext.Provider
      value={{
        boardTheme: getBoardThemeById(boardThemeId),
        setBoardThemeId,
        coordinateMode,
        setCoordinateMode,
        showMoveDots,
        setShowMoveDots,
        showCaptureIndicator,
        setShowCaptureIndicator,
      }}
    >
      {children}
    </BoardThemeContext.Provider>
  );
};

export default BoardThemeProvider;
