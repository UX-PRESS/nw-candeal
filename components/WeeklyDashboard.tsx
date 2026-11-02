"use client";

import {
  CalendarCheck2,
  Clock3,
  Info,
  Plus,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AssignmentDetails } from "@/components/AssignmentDetails";
import { AssignmentForm, type AssignmentInput } from "@/components/AssignmentForm";
import { EmptyState } from "@/components/EmptyState";
import { MeetingSection } from "@/components/MeetingSection";
import { WeekNavigator } from "@/components/WeekNavigator";
import { createMockAssignments, mockDataNotice } from "@/data/assignments";
import {
  addDays,
  addWeeks,
  formatFullDate,
  formatWeekRange,
  fromDateKey,
  getStartOfWeek,
  toDateKey,
} from "@/lib/dates";
import {
  getAssignmentsForWeek,
  getNextAssignment,
  groupAssignmentsByMeeting,
} from "@/lib/assignments";
import type { Assignment } from "@/types/assignment";

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
  const [assignments, setAssignments] = useState(() =>
    createMockAssignments(fromDateKey(initialWeekStart)),
  );
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] =
    useState<Assignment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const assignmentsForWeek = useMemo(
    () => getAssignmentsForWeek(assignments, selectedWeekStart),
    [assignments, selectedWeekStart],
  );
  const meetingGroups = useMemo(
    () => groupAssignmentsByMeeting(assignmentsForWeek),
    [assignmentsForWeek],
  );
  const nextAssignment = getNextAssignment(
    assignmentsForWeek,
    selectedWeekStart,
    currentWeekStart,
    new Date(initialDateTime),
  );
  const currentWeekLabel = formatWeekRange(selectedWeekStart);
  const newAssignmentDate = toDateKey(addDays(selectedWeekStart, 2));

  const changeWeek = (direction: number) => {
    setSelectedWeekStart((weekStart) => addWeeks(weekStart, direction));
    setSelectedAssignment(null);
  };

  const openNewAssignmentForm = () => {
    setEditingAssignment(null);
    setIsFormOpen(true);
  };

  const openEditAssignmentForm = (assignment: Assignment) => {
    setSelectedAssignment(null);
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const saveAssignment = (input: AssignmentInput) => {
    if (editingAssignment) {
      setAssignments((currentAssignments) =>
        currentAssignments.map((assignment) =>
          assignment.id === editingAssignment.id
            ? { ...input, id: editingAssignment.id }
            : assignment,
        ),
      );
    } else {
      setAssignments((currentAssignments) => [
        ...currentAssignments,
        { ...input, id: crypto.randomUUID() },
      ]);
    }

    setSelectedWeekStart(getStartOfWeek(fromDateKey(input.date)));
    setSelectedAssignment(null);
    setEditingAssignment(null);
    setIsFormOpen(false);
  };

  const deleteAssignment = (assignment: Assignment) => {
    setAssignments((currentAssignments) =>
      currentAssignments.filter((current) => current.id !== assignment.id),
    );
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
            Consulte e organize os responsáveis por cada parte das reuniões.
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

      <section
        className="weekly-overview"
        aria-label="Resumo das designações da semana"
      >
        <div className="weekly-total">
          <span>Designações nesta semana</span>
          <strong>{assignmentsForWeek.length}</strong>
        </div>
        <button
          className="primary-button add-assignment-button"
          type="button"
          onClick={openNewAssignmentForm}
        >
          <Plus aria-hidden="true" size={18} />
          Nova designação
        </button>
      </section>

      <section className="schedule-content" id="weekly-schedule" aria-live="polite">
        {nextAssignment ? (
          <section className="next-meeting" aria-labelledby="next-meeting-title">
            <div className="next-meeting-icon" aria-hidden="true">
              <Clock3 size={22} />
            </div>
            <div className="next-meeting-copy">
              <p>Próxima reunião</p>
              <h2 id="next-meeting-title">
                {nextAssignment.meetingType === "midweek"
                  ? "Reunião do meio de semana"
                  : "Reunião do fim de semana"}
              </h2>
              <span>
                {formatFullDate(nextAssignment.date)}
                {nextAssignment.startTime
                  ? ` · ${nextAssignment.startTime}`
                  : ""}
              </span>
            </div>
            <div className="next-meeting-assignment">
              <span>Próxima designação</span>
              <strong>{nextAssignment.participantName}</strong>
              <small>{nextAssignment.title}</small>
            </div>
          </section>
        ) : null}

        {assignmentsForWeek.length > 0 ? (
          <div className="meetings-grid">
            {meetingGroups.map((group) => (
              <MeetingSection
                key={`${group.date}-${group.meetingType}`}
                date={group.date}
                meetingType={group.meetingType}
                assignments={group.assignments}
                onSelect={setSelectedAssignment}
              />
            ))}
          </div>
        ) : (
          <EmptyState weekRange={currentWeekLabel} />
        )}
      </section>

      <footer className="site-footer">
        MVP 1 · Alterações temporárias nesta sessão · Dados apenas para demonstração
      </footer>

      <AssignmentDetails
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onEdit={openEditAssignmentForm}
        onDelete={deleteAssignment}
      />

      {isFormOpen ? (
        <AssignmentForm
          key={`${editingAssignment?.id ?? "new"}-${newAssignmentDate}`}
          assignment={editingAssignment}
          initialDate={newAssignmentDate}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAssignment(null);
          }}
          onSave={saveAssignment}
        />
      ) : null}
    </main>
  );
}
