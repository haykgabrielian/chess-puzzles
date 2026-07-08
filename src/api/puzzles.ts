import type { Puzzle } from '@/types/puzzle';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '';

export const getPuzzleByDateUrl = (dateString: string): string =>
  `${apiBaseUrl}/api/puzzles/${dateString}`;

export const fetchPuzzleByDate = async (
  dateString: string,
): Promise<Puzzle | undefined> => {
  const url = getPuzzleByDateUrl(dateString);
  console.log('[puzzle] GET', url);

  const response = await fetch(url);

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`Failed to load puzzle for ${dateString}`);
  }

  return response.json() as Promise<Puzzle>;
};
