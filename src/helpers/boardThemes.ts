export type BoardCoordinateMode = 'aside' | 'inside';

export type BoardTheme = {
  id: string;
  name: string;
  light: string;
  dark: string;
  coordinate: string;
  frame: string;
};

export const boardCoordinateModes: { id: BoardCoordinateMode; name: string }[] = [
  { id: 'aside', name: 'Aside' },
  { id: 'inside', name: 'Inside Board' },
];

export const defaultBoardCoordinateMode: BoardCoordinateMode = 'aside';

export const boardThemes: BoardTheme[] = [
  {
    id: 'classic-wood',
    name: 'Classic Wood',
    light: '#f0d9b5',
    dark: '#b58863',
    coordinate: '#575452',
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
    id: 'sandstone',
    name: 'Sandstone',
    light: '#f5ecd7',
    dark: '#c7b89a',
    coordinate: '#6b6358',
    frame: '#ffffff',
  },
  {
    id: 'midnight-navy',
    name: 'Marble Blue',
    light: '#D9E4E8',
    dark: '#7498AE',
    coordinate: '#7498AE',
    frame: '#ffffff',
  },
  {
    id: 'onyx',
    name: 'Wood',
    light: '#C5AB8A',
    dark: '#715239',
    coordinate: '#715239',
    frame: '#ffffff',
  },
  {
    id: 'slate',
    name: 'Slate',
    light: '#e3e6ea',
    dark: '#5c6670',
    coordinate: '#5c6670',
    frame: '#ffffff',
  },
];

export const defaultBoardThemeId = boardThemes[0].id;

export const getBoardThemeById = (id: string): BoardTheme =>
  boardThemes.find(theme => theme.id === id) ?? boardThemes[0];
