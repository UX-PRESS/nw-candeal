"use client";

import {
  Clock3,
  FileText,
  Pencil,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { formatFullDate } from "@/lib/dates";
import type { ActionResult, Assignment, MeetingType } from "@/types/assignment";

type AssignmentDetailsProps = {
  assignment: Assignment | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => Promise<ActionResult<null>>;
};

const meetingLabels: Record<MeetingType, string> = {
  midweek: "Reunião do meio de semana",
  weekend: "Reunião do fim de semana",
};

export function AssignmentDetails({
  assignment,
  canManage,
  onClose,
  onEdit,
  onDelete,
}: AssignmentDetailsProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmingDeleteFor, setConfirmingDeleteFor] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!assignment) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [assignment]);

  if (!assignment) {
    return null;
  }

  const timing = [
    assignment.startTime,
    assignment.durationMinutes ? `${assignment.durationMinutes} minutos` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
  const confirmingDelete = confirmingDeleteFor === assignment.id;

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await onDelete(assignment);
      if (!result.ok) {
        setDeleteError(result.error);
      }
    } catch {
      setDeleteError("Não foi possível excluir. Verifique a conexão e tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="assignment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-details-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onClose();
          }
        }}
      >
        <header className="dialog-header">
          <div>
            <p className="dialog-eyebrow">{meetingLabels[assignment.meetingType]}</p>
            <h2 id="assignment-details-title">{assignment.title}</h2>
          </div>
          <button
            className="icon-button dialog-close"
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            ref={closeButtonRef}
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <dl className="details-list">
          <div>
            <dt>Seção</dt>
            <dd>{assignment.section}</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{formatFullDate(assignment.date)}</dd>
          </div>
          {timing ? (
            <div>
              <dt>
                <Clock3 aria-hidden="true" size={16} /> Horário e duração
              </dt>
              <dd>{timing}</dd>
            </div>
          ) : null}
          <div>
            <dt>
              <UserRound aria-hidden="true" size={16} /> Participante
            </dt>
            <dd>{assignment.participantName}</dd>
          </div>
          {assignment.assistantName ? (
            <div>
              <dt>
                <UsersRound aria-hidden="true" size={16} /> Ajudante
              </dt>
              <dd>{assignment.assistantName}</dd>
            </div>
          ) : null}
          {assignment.notes ? (
            <div className="details-note">
              <dt>
                <FileText aria-hidden="true" size={16} /> Observações
              </dt>
              <dd>{assignment.notes}</dd>
            </div>
          ) : null}
        </dl>
        <footer className="dialog-actions">
          {!canManage ? null : confirmingDelete ? (
            <div className="delete-confirmation" role="alert">
              <p>Deseja excluir esta designação? Esta ação não pode ser desfeita.</p>
              {deleteError ? (
                <p className="status-message status-message--error" role="alert">
                  {deleteError}
                </p>
              ) : null}
              <div className="form-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setConfirmingDeleteFor(null)}
                >
                  Cancelar
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir designação"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                className="secondary-button"
                type="button"
                onClick={() => onEdit(assignment)}
              >
                <Pencil aria-hidden="true" size={16} />
                Editar
              </button>
              <button
                className="danger-outline-button"
                type="button"
                onClick={() => setConfirmingDeleteFor(assignment.id)}
              >
                <Trash2 aria-hidden="true" size={16} />
                Excluir
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
