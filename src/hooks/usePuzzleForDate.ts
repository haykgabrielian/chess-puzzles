import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchPuzzleByDate } from "@/api/puzzles";

export const puzzleQueryKeys = {
  date: (dateString: string) => ["puzzles", "date", dateString] as const,
};

export const usePuzzleForDate = (dateString: string) => {
  const query = useQuery({
    queryKey: puzzleQueryKeys.date(dateString),
    queryFn: () => fetchPuzzleByDate(dateString),
    placeholderData: keepPreviousData,
  });

  return {
    puzzle: query.data,
    // With keepPreviousData, isLoading is only true on the first-ever load.
    // Switching dates keeps the previous puzzle visible while the new one
    // fetches, so this stays false and the section no longer flickers.
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
