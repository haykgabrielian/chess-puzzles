import { useQuery } from "@tanstack/react-query";

import { fetchPuzzleByDate } from "@/api/puzzles";

export const puzzleQueryKeys = {
  date: (dateString: string) => ["puzzles", "date", dateString] as const,
};

export const usePuzzleForDate = (dateString: string) => {
  const query = useQuery({
    queryKey: puzzleQueryKeys.date(dateString),
    queryFn: () => fetchPuzzleByDate(dateString),
  });

  return {
    puzzle: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};
