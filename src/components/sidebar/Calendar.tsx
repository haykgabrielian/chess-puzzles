import { useMemo, useState } from "react";
import styled from "styled-components";

import Card from "@/components/ui/Card";
import { usePuzzle } from "@/context/PuzzleContext";
import { canNavigateToNextMonth, getToday, isFutureDate } from "@/helpers/date";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  margin-bottom: 9px;
`;

const MonthLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NavButton = styled.button<{ $isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};
  color: ${({ $isDisabled, theme }) =>
    $isDisabled ? theme.text.muted : theme.text.secondary};
  background: transparent;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.45 : 1)};
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.button.background};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const TodayButton = styled.button`
  height: 32px;
  padding: 0 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
  background: transparent;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.button.background};
  }
`;

const WeekdayRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-top: 4px;
  margin-bottom: 10px;
`;

const Weekday = styled.span`
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  padding: 4px 0;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 40px;
  gap: 2px;
`;

const DayButton = styled.button<{
  $isSelected: boolean;
  $isMuted: boolean;
  $isDisabled: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  justify-self: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};
  font-size: 0.875rem;
  font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 400)};
  color: ${({ $isSelected, $isMuted, $isDisabled, theme }) => {
    if ($isDisabled) return theme.text.muted;
    if ($isSelected) return theme.onAccent;
    if ($isMuted) return theme.text.muted;
    return theme.text.primary;
  }};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.accent : "transparent"};
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.45 : 1)};
  transition: background-color 0.15s ease;

  &:hover:not([aria-current="date"]):not(:disabled) {
    background-color: ${({ $isSelected, theme }) =>
      $isSelected ? theme.accent : theme.button.background};
  }
`;

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

const getMonthDays = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const ChevronLeft = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const getMonthStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const Calendar = () => {
  const today = useMemo(() => getToday(), []);
  const { selectedDate, setSelectedDate } = usePuzzle();
  const [viewDate, setViewDate] = useState(() => getMonthStart(selectedDate));
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);

  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate);
    setViewDate(getMonthStart(selectedDate));
  }

  const canGoNextMonth = canNavigateToNextMonth(viewDate);

  const days = useMemo(
    () => getMonthDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate],
  );

  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setViewDate(
      getMonthStart(
        new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
      ),
    );
  };

  const goToNextMonth = () => {
    if (!canGoNextMonth) {
      return;
    }

    setViewDate(
      getMonthStart(
        new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
      ),
    );
  };

  const goToToday = () => {
    setSelectedDate(today);
  };

  return (
    <Card
      title="Calendar"
      collapsibleOnMobile
      defaultMobileCollapsed={false}
    >
      <CalendarHeader>
        <MonthLabel>{monthLabel}</MonthLabel>
        <NavButtons>
          <NavButton
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </NavButton>
          <TodayButton
            type="button"
            onClick={goToToday}
            aria-label="Go to today"
          >
            Today
          </TodayButton>
          <NavButton
            type="button"
            onClick={goToNextMonth}
            disabled={!canGoNextMonth}
            $isDisabled={!canGoNextMonth}
            aria-label="Next month"
          >
            <ChevronRight />
          </NavButton>
        </NavButtons>
      </CalendarHeader>
      <WeekdayRow aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <Weekday key={day}>{day}</Weekday>
        ))}
      </WeekdayRow>
      <DaysGrid role="grid" aria-label={monthLabel}>
        {days.map(({ date, isCurrentMonth }) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isDisabled = isFutureDate(date);

          return (
            <DayButton
              key={date.toISOString()}
              type="button"
              role="gridcell"
              $isSelected={isSelected}
              $isMuted={!isCurrentMonth}
              $isDisabled={isDisabled}
              disabled={isDisabled}
              aria-current={isToday ? "date" : undefined}
              aria-disabled={isDisabled || undefined}
              aria-label={date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
              onClick={() => setSelectedDate(date)}
            >
              {date.getDate()}
            </DayButton>
          );
        })}
      </DaysGrid>
    </Card>
  );
};

export default Calendar;
