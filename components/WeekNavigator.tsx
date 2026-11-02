"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { formatWeekRange } from "@/lib/dates";

type WeekNavigatorProps = {
  weekStart: Date;
  onPreviousWeek: () => void;
  onCurrentWeek: () => void;
  onNextWeek: () => void;
};

export function WeekNavigator({
  weekStart,
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
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>

      <div className="week-range" aria-live="polite">
        <CalendarDays aria-hidden="true" size={18} />
        <span>{formatWeekRange(weekStart)}</span>
      </div>

      <button className="today-button" type="button" onClick={onCurrentWeek}>
        Semana atual
      </button>

      <button
        className="icon-button"
        type="button"
        onClick={onNextWeek}
        aria-label="Próxima semana"
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
    </nav>
  );
}
