export function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  start.setDate(start.getDate() - daysSinceMonday);
  start.setHours(0, 0, 0, 0);

  return start;
}

export function addWeeks(date: Date, amount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount * 7);
  return nextDate;
}

export function addDays(date: Date, amount: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidDateKey(dateKey: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getWeekEnd(weekStart: Date): Date {
  return addDays(weekStart, 6);
}

export function isDateInWeek(dateKey: string, weekStart: Date): boolean {
  const weekEnd = getWeekEnd(weekStart);
  return dateKey >= toDateKey(weekStart) && dateKey <= toDateKey(weekEnd);
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart);
  const shortDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  });
  const longDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
    return `${longDate.format(weekStart)} — ${longDate.format(weekEnd)}`;
  }

  return `${shortDate.format(weekStart)} — ${longDate.format(weekEnd)}`;
}

export function formatFullDate(dateKey: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fromDateKey(dateKey));
}

export function formatMeetingDate(dateKey: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(fromDateKey(dateKey));
}
