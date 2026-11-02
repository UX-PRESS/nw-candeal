"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { formatWeekRange } from "@/lib/dates";

type WeekNavigatorProps = {
  weekStart: Date;
  disabled?: boolean;
  onPreviousWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;
};

export function WeekNavigator({
  weekStart,
  disabled = false,
  onPreviousWeek,
  onCurrentWeek,
  onNextWeek,
}: WeekNavigatorProps) {
  return (
    <nav className="week-navigator" aria-label="Navegação semanal">
      <button
        className="icon-button"
        type="button"
        onClick={onPreviousWeek}
        aria-label="Semana anterior"
        disabled={disabled}
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>

      <div className="week-range" aria-live="polite">
        <CalendarDays aria-hidden="true" size={18} />
        <span>{formatWeekRange(weekStart)}</span>
      </div>

      <button
        className="today-button"
        type="button"
        onClick={onCurrentWeek}
        disabled={disabled}
      >
        Semana atual
      </button>

      <button
        className="icon-button"
        type="button"
        onClick={onNextWeek}
        aria-label="Próxima semana"
        disabled={disabled}
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
    </nav>
  );
}
