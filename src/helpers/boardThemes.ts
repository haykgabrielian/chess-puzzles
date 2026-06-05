export type BoardCoordinateMode = 'aside' | 'inside' | 'none';

export type BoardHighlight = {
  selected: string;
  lastMove: string;
  hint: string;
  wrong: string;
  moveDotOnLight: string;
  moveDotOnDark: string;
  captureRingOnLight: string;
  captureRingOnDark: string;
};

export type BoardTheme = {
  id: string;
  name: string;
  light: string;
  dark: string;
  coordinate: string;
  frame: string;
  /** Optional CSS layer drawn on top of `light` (texture only, not the fill color). */
  lightTexture?: string;
  /** Optional CSS layer drawn on top of `dark` (texture only, not the fill color). */
  darkTexture?: string;
  highlight: BoardHighlight;
};

export const getSquareBackground = (theme: BoardTheme, isLight: boolean): string => {
  const texture = isLight ? theme.lightTexture : theme.darkTexture;
  const color = isLight ? theme.light : theme.dark;

  return texture ? `${texture}, ${color}` : color;
};

const rgbaFromHex = (hex: string, alpha: number): string => {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const createBoardHighlight = (light: string, dark: string): BoardHighlight => ({
  selected: rgbaFromHex(dark, 0.34),
  lastMove: rgbaFromHex(dark, 0.24),
  hint: rgbaFromHex(dark, 0.3),
  wrong: 'rgba(178, 95, 95, 0.55)',
  moveDotOnLight: rgbaFromHex(dark, 0.58),
  moveDotOnDark: rgbaFromHex(light, 0.82),
  captureRingOnLight: rgbaFromHex(dark, 0.72),
  captureRingOnDark: rgbaFromHex(light, 0.88),
});

const baseBoardThemes = [
  {
    id: 'classic-wood',
    name: 'Classic Wood',
    light: '#f0d9b5',
    dark: '#b58863',
    coordinate: '#575452',
    frame: '#ffffff',
  },
  {
    id: 'sandstone',
    name: 'Sandstone',
    light: '#f5ecd7',
    dark: '#c7b89a',
    coordinate: '#6b6358',
    frame: '#ffffff',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    light: '#EBECD0',
    dark: '#729552',
    coordinate: '#729552',
    frame: '#ffffff',
  },
  {
    id: 'onyx',
    name: 'Sage Mist',
    light: '#FAF6EB',
    dark: '#B2C2AD',
    coordinate: '#B2C2AD',
    frame: '#ffffff',
  },
  {
    id: 'vintage-blue',
    name: 'Vintage Blue',
    light: '#EAE9D2',
    dark: '#4B7399',
    coordinate: '#4B7399',
    frame: '#ffffff',
  },
  {
    id: 'midnight-navy',
    name: 'Marble Blue',
    light: '#DEE3E6',
    dark: '#8CA2AD',
    coordinate: '#8CA2AD',
    frame: '#ffffff',
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    light: '#F0EEF0',
    dark: '#8977B7',
    coordinate: '#8977B7',
    frame: '#ffffff',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    light: '#FFFFFF',
    dark: '#FCD8DD',
    coordinate: '#FCD8DD',
    frame: '#ffffff',
  },
  {
    id: 'newspaper',
    name: 'Newspaper',
    light: '#FFFFFF',
    dark: '#CFCFCF',
    coordinate: '#7A7A7A',
    frame: '#ffffff',
    darkTexture:
      'repeating-linear-gradient(-45deg, #9A9A9A 0, #9A9A9A 2px, transparent 2px, transparent 5px)',
  },
] as const;

export const boardCoordinateModes: { id: BoardCoordinateMode; name: string }[] = [
  { id: 'aside', name: 'Aside' },
  { id: 'inside', name: 'Inside Board' },
  { id: 'none', name: 'None' },
];

export const defaultBoardCoordinateMode: BoardCoordinateMode = 'aside';

export const boardThemes: BoardTheme[] = baseBoardThemes.map(theme => ({
  ...theme,
  highlight: createBoardHighlight(theme.light, theme.dark),
}));

export const defaultBoardThemeId = 'midnight-navy';

export const defaultShowMoveDots = true;
export const defaultShowCaptureIndicator = true;
export const defaultAnimateMoves = true;

const legacyBoardThemeIds: Record<string, string> = {
  slate: 'vintage-blue',
  'soft-violet': 'sakura',
};

export const resolveBoardThemeId = (id: string): string => legacyBoardThemeIds[id] ?? id;

export const getBoardThemeById = (id: string): BoardTheme =>
  boardThemes.find(theme => theme.id === resolveBoardThemeId(id)) ?? boardThemes[0];
