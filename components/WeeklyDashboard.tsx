"use client";

import { CalendarCheck2, Clock3, Info, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { AssignmentDetails } from "@/components/AssignmentDetails";
import { EmptyState } from "@/components/EmptyState";
import { MeetingSection } from "@/components/MeetingSection";
import { WeekNavigator } from "@/components/WeekNavigator";
import { createMockAssignments, mockDataNotice } from "@/data/assignments";
import {
  addWeeks,
  formatFullDate,
  formatWeekRange,
  fromDateKey,
  getStartOfWeek,
  isDateInWeek,
} from "@/lib/dates";
import type { Assignment, MeetingType } from "@/types/assignment";

const meetingLabels: Record<MeetingType, string> = {
  midweek: "Reunião do meio de semana",
  weekend: "Reunião do fim de semana",
};

function sortAssignments(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort((first, second) => {
    const firstTime = `${first.date}T${first.startTime ?? "00:00"}`;
    const secondTime = `${second.date}T${second.startTime ?? "00:00"}`;
    return firstTime.localeCompare(secondTime);
  });
}

function getAssignmentDateTime(assignment: Assignment): Date {
  return new Date(`${assignment.date}T${assignment.startTime ?? "00:00"}`);
}

type WeeklyDashboardProps = {
  initialWeekStart: string;
  initialDateTime: string;
};

export function WeeklyDashboard({
  initialWeekStart,
  initialDateTime,
}: WeeklyDashboardProps) {
  const [currentWeekStart] = useState(() =>
    getStartOfWeek(fromDateKey(initialWeekStart)),
  );
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStart);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const mockAssignments = useMemo(() => createMockAssignments(currentWeekStart), [currentWeekStart]);

  const assignmentsForWeek = useMemo(
    () =>
      sortAssignments(
        mockAssignments.filter((assignment) =>
          isDateInWeek(assignment.date, selectedWeekStart),
        ),
      ),
    [mockAssignments, selectedWeekStart],
  );

  const midweekAssignments = assignmentsForWeek.filter(
    (assignment) => assignment.meetingType === "midweek",
  );
  const weekendAssignments = assignmentsForWeek.filter(
    (assignment) => assignment.meetingType === "weekend",
  );
  const nextAssignment =
    assignmentsForWeek.find(
      (assignment) => getAssignmentDateTime(assignment) >= new Date(initialDateTime),
    ) ?? assignmentsForWeek[0];
  const currentWeekLabel = formatWeekRange(selectedWeekStart);

  const changeWeek = (direction: number) => {
    setSelectedWeekStart((weekStart) => addWeeks(weekStart, direction));
    setSelectedAssignment(null);
  };

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="#weekly-schedule" aria-label="Agenda Congregação">
          <span className="brand-mark" aria-hidden="true">
            <CalendarCheck2 size={19} />
          </span>
          <span>Agenda Congregação</span>
        </a>
        <span className="demo-badge">
          <Sparkles aria-hidden="true" size={14} /> Demonstração
        </span>
      </header>

      <section className="page-intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Agenda semanal</p>
          <h1 id="page-title">Designações da semana</h1>
          <p className="page-summary">
            Consulte rapidamente os responsáveis por cada parte das reuniões.
          </p>
        </div>
        <p className="mock-notice">
          <Info aria-hidden="true" size={16} />
          {mockDataNotice}
        </p>
      </section>

      <WeekNavigator
        weekStart={selectedWeekStart}
        onPreviousWeek={() => changeWeek(-1)}
        onCurrentWeek={() => {
          setSelectedWeekStart(currentWeekStart);
          setSelectedAssignment(null);
        }}
        onNextWeek={() => changeWeek(1)}
      />

      <section className="schedule-content" id="weekly-schedule" aria-live="polite">
        {nextAssignment ? (
          <section className="next-meeting" aria-labelledby="next-meeting-title">
            <div className="next-meeting-icon" aria-hidden="true">
              <Clock3 size={22} />
            </div>
            <div className="next-meeting-copy">
              <p>Próxima reunião</p>
              <h2 id="next-meeting-title">{meetingLabels[nextAssignment.meetingType]}</h2>
              <span>
                {formatFullDate(nextAssignment.date)} · {nextAssignment.startTime}
              </span>
            </div>
            <div className="next-meeting-assignment">
              <span>Primeira designação</span>
              <strong>{nextAssignment.participantName}</strong>
            </div>
          </section>
        ) : null}

        {assignmentsForWeek.length > 0 ? (
          <div className="meetings-grid">
            <MeetingSection
              meetingType="midweek"
              assignments={midweekAssignments}
              onSelect={setSelectedAssignment}
            />
            <MeetingSection
              meetingType="weekend"
              assignments={weekendAssignments}
              onSelect={setSelectedAssignment}
            />
          </div>
        ) : (
          <EmptyState weekRange={currentWeekLabel} />
        )}
      </section>

      <footer className="site-footer">
        MVP 1 · Agenda semanal · Dados apenas para demonstração
      </footer>

      <AssignmentDetails
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
      />
    </main>
  );
}
