import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { createPlaceholderPuzzle } from "@/data/dummyPuzzle";
import {
  formatDateForUrl,
  getToday,
  isFutureDate,
  normalizeDate,
  parseDateFromUrl,
} from "@/helpers/date";
import { usePuzzleForDate } from "@/hooks/usePuzzleForDate";
import { dateRoute } from "@/router";
import type { Puzzle } from "@/types/puzzle";

type PuzzleContextValue = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  puzzle: Puzzle;
  hasPuzzle: boolean;
  isLoading: boolean;
};

const PuzzleContext = createContext<PuzzleContextValue | null>(null);

export const usePuzzle = () => {
  const context = useContext(PuzzleContext);

  if (!context) {
    throw new Error("usePuzzle must be used within PuzzleProvider");
  }

  return context;
};

const PuzzleProvider = ({ children }: { children: ReactNode }) => {
  const { date: dateParam } = dateRoute.useParams();
  const navigate = useNavigate();

  const selectedDate = useMemo(
    () => parseDateFromUrl(dateParam) ?? getToday(),
    [dateParam],
  );

  const dateString = formatDateForUrl(selectedDate);
  const { puzzle: fetchedPuzzle, isLoading } = usePuzzleForDate(dateString);

  const setSelectedDate = useCallback(
    (date: Date) => {
      const normalized = normalizeDate(date);

      if (isFutureDate(normalized)) {
        return;
      }

      const nextDate = formatDateForUrl(normalized);

      if (nextDate === dateParam) {
        return;
      }

      navigate({
        to: "/$date",
        params: { date: nextDate },
      });
    },
    [dateParam, navigate],
  );

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      puzzle: fetchedPuzzle ?? createPlaceholderPuzzle(dateString),
      hasPuzzle: Boolean(fetchedPuzzle),
      isLoading,
    }),
    [selectedDate, setSelectedDate, fetchedPuzzle, dateString, isLoading],
  );

  return (
    <PuzzleContext.Provider value={value}>{children}</PuzzleContext.Provider>
  );
};

export default PuzzleProvider;
