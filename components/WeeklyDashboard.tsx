"use client";

import {
  CalendarCheck2,
  Clock3,
  Database,
  Info,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  createAssignmentAction,
  deleteAssignmentAction,
  listAssignmentsForWeekAction,
  updateAssignmentAction,
} from "@/app/actions/assignments";
import { AssignmentDetails } from "@/components/AssignmentDetails";
import { AssignmentForm } from "@/components/AssignmentForm";
import { EmptyState } from "@/components/EmptyState";
import { MeetingSection } from "@/components/MeetingSection";
import { SignOutButton } from "@/components/SignOutButton";
import { WeekNavigator } from "@/components/WeekNavigator";
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
import type {
  ActionResult,
  Assignment,
  AssignmentInput,
} from "@/types/assignment";

type WeeklyDashboardProps = {
  initialWeekStart: string;
  initialDateTime: string;
  initialAssignments: Assignment[];
  initialLoadError: string | null;
  permissionError: string | null;
  isAdministrator: boolean;
  userEmail: string;
};

export function WeeklyDashboard({
  initialWeekStart,
  initialDateTime,
  initialAssignments,
  initialLoadError,
  permissionError,
  isAdministrator,
  userEmail,
}: WeeklyDashboardProps) {
  const [currentWeekStart] = useState(() =>
    getStartOfWeek(fromDateKey(initialWeekStart)),
  );
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStart);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [loadError, setLoadError] = useState(initialLoadError);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const refreshWeek = async (weekStart: Date): Promise<boolean> => {
    setIsLoading(true);
    setLoadError(null);
    const weekStartKey = toDateKey(weekStart);

    try {
      const result = await listAssignmentsForWeekAction(weekStartKey);
      if (!result.ok) {
        setLoadError(result.error);
        return false;
      }

      setAssignments(result.data);
      return true;
    } catch {
      setLoadError(
        "Não foi possível atualizar as designações. Verifique a conexão e tente novamente.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changeWeek = (direction: number) => {
    const nextWeekStart = addWeeks(selectedWeekStart, direction);
    setSelectedWeekStart(nextWeekStart);
    setSelectedAssignment(null);
    setStatusMessage(null);
    void refreshWeek(nextWeekStart);
  };

  const selectCurrentWeek = () => {
    setSelectedWeekStart(currentWeekStart);
    setSelectedAssignment(null);
    setStatusMessage(null);
    void refreshWeek(currentWeekStart);
  };

  const openNewAssignmentForm = () => {
    setEditingAssignment(null);
    setIsFormOpen(true);
  };

  const openEditAssignmentForm = (assignment: Assignment) => {
    if (!isAdministrator) {
      return;
    }
    setSelectedAssignment(null);
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const saveAssignment = async (
    input: AssignmentInput,
  ): Promise<ActionResult<Assignment>> => {
    if (!isAdministrator) {
      return {
        ok: false,
        error: "Somente administradores podem alterar as designações.",
      };
    }

    const result = editingAssignment
      ? await updateAssignmentAction(editingAssignment.id, input)
      : await createAssignmentAction(input);

    if (!result.ok) {
      return result;
    }

    const targetWeekStart = getStartOfWeek(fromDateKey(result.data.date));
    setSelectedWeekStart(targetWeekStart);
    setEditingAssignment(null);
    setIsFormOpen(false);
    setStatusMessage(
      editingAssignment
        ? "Designação atualizada com sucesso."
        : "Designação adicionada com sucesso.",
    );
    await refreshWeek(targetWeekStart);

    return result;
  };

  const deleteAssignment = async (
    assignment: Assignment,
  ): Promise<ActionResult<null>> => {
    if (!isAdministrator) {
      return {
        ok: false,
        error: "Somente administradores podem alterar as designações.",
      };
    }

    const result = await deleteAssignmentAction(assignment.id);
    if (!result.ok) {
      return result;
    }

    setSelectedAssignment(null);
    setStatusMessage("Designação excluída com sucesso.");
    await refreshWeek(selectedWeekStart);

    return result;
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
        <div className="account-controls">
          <span className="connection-badge">
            <Database aria-hidden="true" size={14} />
            Supabase
          </span>
          <span className="account-email" title={userEmail}>
            {userEmail}
          </span>
          <span className={`role-badge${isAdministrator ? " role-badge--admin" : ""}`}>
            {isAdministrator ? "Administrador" : "Leitura"}
          </span>
          <SignOutButton />
        </div>
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
          Alterações são sincronizadas com o Supabase e ficam disponíveis em
          outros dispositivos autorizados.
        </p>
      </section>

      <WeekNavigator
        weekStart={selectedWeekStart}
        disabled={isLoading}
        onPreviousWeek={() => changeWeek(-1)}
        onCurrentWeek={selectCurrentWeek}
        onNextWeek={() => changeWeek(1)}
      />

      <section
        className="weekly-overview"
        aria-label="Resumo das designações da semana"
      >
        <div className="weekly-total">
          <span>Designações nesta semana</span>
          <strong>{isLoading ? "…" : assignmentsForWeek.length}</strong>
        </div>
        {isAdministrator ? (
          <button
            className="primary-button add-assignment-button"
            type="button"
            onClick={openNewAssignmentForm}
            disabled={isLoading}
          >
            <Plus aria-hidden="true" size={18} />
            Nova designação
          </button>
        ) : null}
      </section>

      {permissionError ? (
        <p className="status-message status-message--error" role="alert">
          {permissionError}
        </p>
      ) : null}
      {statusMessage ? (
        <p className="status-message status-message--success" role="status">
          {statusMessage}
        </p>
      ) : null}

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

        {loadError ? (
          <div className="load-error-panel" role="alert">
            <p>{loadError}</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => void refreshWeek(selectedWeekStart)}
              disabled={isLoading}
            >
              <RefreshCw aria-hidden="true" size={16} />
              {isLoading ? "Carregando..." : "Tentar novamente"}
            </button>
          </div>
        ) : isLoading && assignmentsForWeek.length === 0 ? (
          <p className="loading-state" role="status">
            Carregando designações...
          </p>
        ) : assignmentsForWeek.length > 0 ? (
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
        MVP 1.1 · Dados armazenados no Supabase · Acesso sujeito às permissões da conta
      </footer>

      <AssignmentDetails
        assignment={selectedAssignment}
        canManage={isAdministrator}
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
