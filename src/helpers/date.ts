const DATE_URL_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const getToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const formatDateForUrl = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateFromUrl = (value: string): Date | null => {
  if (!DATE_URL_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

export const normalizeDate = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isFutureDate = (date: Date): boolean =>
  normalizeDate(date).getTime() > getToday().getTime();

export const canNavigateToNextMonth = (viewDate: Date): boolean => {
  const today = getToday();
  const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  return (
    nextMonth.getFullYear() < today.getFullYear() ||
    (nextMonth.getFullYear() === today.getFullYear() && nextMonth.getMonth() <= today.getMonth())
  );
};
