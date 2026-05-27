export const lightTheme = {
  background: {
    primary: '#f5f5f5',
    secondary: '#ffffff',
  },
  text: {
    primary: '#222222',
    secondary: '#555555',
    muted: '#888888',
  },
  border: '#e0e0e0',
  button: {
    background: '#f0f0f0',
    hover: '#e0e0e0',
  },
  header: {
    background: '#ffffff',
    text: '#222222',
  },
  card: {
    background: '#ffffff',
  },
  popover: {
    background: '#ffffff',
  },
  accent: '#2e7d32',
  accentMuted: '#2e7d3218',
  onAccent: '#ffffff',
  board: {
    light: '#f0d9b5',
    dark: '#b58863',
    coordinate: '#575452',
  },
};

export const darkTheme = {
  background: {
    primary: '#424242',
    secondary: '#424242',
  },
  text: {
    primary: '#e8eaed',
    secondary: '#9aa0a6',
    muted: '#5f6368',
  },
  border: '#525252',
  button: {
    background: '#4a4a4a',
    hover: '#525252',
  },
  header: {
    background: '#424242',
    text: '#e8eaed',
  },
  card: {
    background: '#40414F',
  },
  popover: {
    background: '#40414F',
  },
  accent: '#629a72',
  accentMuted: '#629a7224',
  onAccent: '#ffffff',
  board: {
    light: '#f0d9b5',
    dark: '#b58863',
    coordinate: '#9aa0a6',
  },
};

export type ThemeType = typeof lightTheme;
