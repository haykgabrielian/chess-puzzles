import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchMonthPuzzles, findPuzzleByDate, getMonthKey } from '@/api/puzzles';
import type { Puzzle } from '@/types/puzzle';

export const puzzleQueryKeys = {
  month: (dateString: string) => ['puzzles', 'month', getMonthKey(dateString)] as const,
};

export const usePuzzleForDate = (dateString: string) => {
  const monthQuery = useQuery({
    queryKey: puzzleQueryKeys.month(dateString),
    queryFn: () => fetchMonthPuzzles(dateString),
  });

  const puzzle = useMemo<Puzzle | undefined>(() => {
    if (!monthQuery.data) {
      return undefined;
    }

    return findPuzzleByDate(monthQuery.data, dateString);
  }, [monthQuery.data, dateString]);

  return {
    puzzle,
    isLoading: monthQuery.isLoading,
    isError: monthQuery.isError || (monthQuery.isSuccess && !puzzle),
    error: monthQuery.error,
  };
};
