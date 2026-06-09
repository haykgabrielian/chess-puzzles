import React, { ReactNode, useState } from "react";

import { BoardSettingsContext } from "@/context/BoardSettingsContext";
import {
  type BoardCoordinateMode,
  boardCoordinateModes,
  defaultAnimateMoves,
  defaultBoardCoordinateMode,
  defaultBoardThemeId,
  defaultShowCaptureIndicator,
  defaultShowMoveDots,
  defaultShowSquareBadges,
  getBoardThemeById,
  resolveBoardThemeId,
} from "@/helpers/boardThemes";

const THEME_STORAGE_KEY = "chess-board-theme";
const COORDINATE_MODE_STORAGE_KEY = "chess-board-coordinate-mode";
const SHOW_MOVE_DOTS_STORAGE_KEY = "chess-board-show-move-dots";
const SHOW_CAPTURE_INDICATOR_STORAGE_KEY = "chess-board-show-capture-indicator";
const SHOW_SQUARE_BADGES_STORAGE_KEY = "chess-board-show-square-badges";
const ANIMATE_MOVES_STORAGE_KEY = "chess-board-animate-moves";

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
  return boardCoordinateModes.some((mode) => mode.id === saved)
    ? (saved as BoardCoordinateMode)
    : defaultBoardCoordinateMode;
};

const getInitialBooleanSetting = (
  key: string,
  defaultValue: boolean,
): boolean => {
  const saved = localStorage.getItem(key);

  if (saved === null) {
    return defaultValue;
  }

  return saved === "true";
};

const BoardSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [boardThemeId, setBoardThemeIdState] = useState(getInitialBoardThemeId);
  const [coordinateMode, setCoordinateModeState] = useState(
    getInitialCoordinateMode,
  );
  const [showMoveDots, setShowMoveDotsState] = useState(() =>
    getInitialBooleanSetting(SHOW_MOVE_DOTS_STORAGE_KEY, defaultShowMoveDots),
  );
  const [showCaptureIndicator, setShowCaptureIndicatorState] = useState(() =>
    getInitialBooleanSetting(
      SHOW_CAPTURE_INDICATOR_STORAGE_KEY,
      defaultShowCaptureIndicator,
    ),
  );
  const [showSquareBadges, setShowSquareBadgesState] = useState(() =>
    getInitialBooleanSetting(
      SHOW_SQUARE_BADGES_STORAGE_KEY,
      defaultShowSquareBadges,
    ),
  );
  const [animateMoves, setAnimateMovesState] = useState(() =>
    getInitialBooleanSetting(ANIMATE_MOVES_STORAGE_KEY, defaultAnimateMoves),
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

  const setShowSquareBadges = (enabled: boolean) => {
    localStorage.setItem(SHOW_SQUARE_BADGES_STORAGE_KEY, String(enabled));
    setShowSquareBadgesState(enabled);
  };

  const setAnimateMoves = (enabled: boolean) => {
    localStorage.setItem(ANIMATE_MOVES_STORAGE_KEY, String(enabled));
    setAnimateMovesState(enabled);
  };

  return (
    <BoardSettingsContext.Provider
      value={{
        boardTheme: getBoardThemeById(boardThemeId),
        setBoardThemeId,
        coordinateMode,
        setCoordinateMode,
        showMoveDots,
        setShowMoveDots,
        showCaptureIndicator,
        setShowCaptureIndicator,
        showSquareBadges,
        setShowSquareBadges,
        animateMoves,
        setAnimateMoves,
      }}
    >
      {children}
    </BoardSettingsContext.Provider>
  );
};

export default BoardSettingsProvider;
