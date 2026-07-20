export const lightTheme = {
  background: {
    primary: "#F4F4F4",
    secondary: "#ffffff",
  },
  text: {
    primary: "#282828",
    secondary: "#555555",
    muted: "#888888",
  },
  border: "#e0e0e0",
  button: {
    background: "#f0f0f0",
    hover: "#e0e0e0",
  },
  card: {
    background: "#ffffff",
  },
  popover: {
    background: "#ffffff",
  },
  accent: "#3A7859",
  accentMuted: "#3A785918",
  onAccent: "#ffffff",
  variation: "#1565c0",
  variationMuted: "#1565c016",
  boardHighlight: {
    selected: "rgba(200, 214, 179, 0.9)",
    lastMove: "rgba(155, 199, 0, 0.41)",
    moveDot: "rgba(20, 85, 30, 0.55)",
    captureRing: "rgba(20, 85, 30, 0.65)",
    hint: "rgba(220, 180, 60, 0.55)",
    wrong: "rgba(178, 95, 95, 0.55)",
    danger: "#b25f5f",
    dangerMuted: "#b25f5f18",
  },
  board: {
    light: "#f0d9b5",
    dark: "#b58863",
    coordinate: "#575452",
  },
};

export const darkTheme = {
  background: {
    primary: "#424242",
    secondary: "#424242",
  },
  text: {
    primary: "#e8eaed",
    secondary: "#9aa0a6",
    muted: "#5f6368",
  },
  border: "#525252",
  button: {
    background: "#4a4a4a",
    hover: "#525252",
  },
  card: {
    background: "#40414F",
  },
  popover: {
    background: "#40414F",
  },
  accent: "#3A7859",
  accentMuted: "#3A785924",
  onAccent: "#ffffff",
  variation: "#90caf9",
  variationMuted: "#1565c028",
  boardHighlight: {
    selected: "rgba(200, 214, 179, 0.9)",
    lastMove: "rgba(155, 199, 0, 0.41)",
    moveDot: "rgba(20, 85, 30, 0.55)",
    captureRing: "rgba(20, 85, 30, 0.65)",
    hint: "rgba(230, 190, 70, 0.55)",
    wrong: "rgba(178, 95, 95, 0.55)",
    danger: "#c97a7a",
    dangerMuted: "#c97a7a24",
  },
  board: {
    light: "#f0d9b5",
    dark: "#b58863",
    coordinate: "#9aa0a6",
  },
};

export type ThemeType = typeof lightTheme;
