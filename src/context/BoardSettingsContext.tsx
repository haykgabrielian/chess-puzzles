import React from "react";

import {
  type BoardCoordinateMode,
  type BoardTheme,
  defaultAnimateMoves,
  defaultBoardCoordinateMode,
  defaultBoardThemeId,
  defaultShowCaptureIndicator,
  defaultShowMoveDots,
  defaultShowSquareBadges,
  defaultSoundEnabled,
  getBoardThemeById,
} from "@/helpers/boardThemes";

export const BoardSettingsContext = React.createContext<{
  boardTheme: BoardTheme;
  setBoardThemeId: (id: string) => void;
  coordinateMode: BoardCoordinateMode;
  setCoordinateMode: (mode: BoardCoordinateMode) => void;
  showMoveDots: boolean;
  setShowMoveDots: (enabled: boolean) => void;
  showCaptureIndicator: boolean;
  setShowCaptureIndicator: (enabled: boolean) => void;
  showSquareBadges: boolean;
  setShowSquareBadges: (enabled: boolean) => void;
  animateMoves: boolean;
  setAnimateMoves: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}>({
  boardTheme: getBoardThemeById(defaultBoardThemeId),
  setBoardThemeId: () => {},
  coordinateMode: defaultBoardCoordinateMode,
  setCoordinateMode: () => {},
  showMoveDots: defaultShowMoveDots,
  setShowMoveDots: () => {},
  showCaptureIndicator: defaultShowCaptureIndicator,
  setShowCaptureIndicator: () => {},
  showSquareBadges: defaultShowSquareBadges,
  setShowSquareBadges: () => {},
  animateMoves: defaultAnimateMoves,
  setAnimateMoves: () => {},
  soundEnabled: defaultSoundEnabled,
  setSoundEnabled: () => {},
});
