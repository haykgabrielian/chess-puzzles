import type { Puzzle } from '@/types/puzzle';

export const getMonthKey = (dateString: string): string => dateString.slice(0, 7);

export const getMonthPuzzleUrl = (dateString: string): string => {
  const year = dateString.slice(0, 4);
  const monthKey = getMonthKey(dateString);
  return `/puzzle/${year}/${monthKey}.json`;
};

export const fetchMonthPuzzles = async (dateString: string): Promise<Puzzle[]> => {
  const url = getMonthPuzzleUrl(dateString);
  console.log('[puzzle] GET', url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load puzzles for ${getMonthKey(dateString)}`);
  }

  return response.json() as Promise<Puzzle[]>;
};

export const findPuzzleByDate = (puzzles: Puzzle[], dateString: string): Puzzle | undefined =>
  puzzles.find(puzzle => puzzle.date === dateString);

