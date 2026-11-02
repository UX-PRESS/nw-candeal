"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import type { Assignment, MeetingType } from "@/types/assignment";

export type AssignmentInput = Omit<Assignment, "id">;

type AssignmentFormProps = {
  assignment: Assignment | null;
  initialDate: string;
  onClose: () => void;
  onSave: (assignment: AssignmentInput) => void;
};

type FormValues = {
  date: string;
  meetingType: MeetingType;
  section: string;
  title: string;
  participantName: string;
  assistantName: string;
  notes: string;
  startTime: string;
  durationMinutes: string;
};

function createFormValues(assignment: Assignment | null, initialDate: string): FormValues {
  return {
    date: assignment?.date ?? initialDate,
    meetingType: assignment?.meetingType ?? "midweek",
    section: assignment?.section ?? "",
    title: assignment?.title ?? "",
    participantName: assignment?.participantName ?? "",
    assistantName: assignment?.assistantName ?? "",
    notes: assignment?.notes ?? "",
    startTime: assignment?.startTime ?? "",
    durationMinutes:
      assignment?.durationMinutes === undefined
        ? ""
        : String(assignment.durationMinutes),
  };
}

export function AssignmentForm({
  assignment,
  initialDate,
  onClose,
  onSave,
}: AssignmentFormProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState(() =>
    createFormValues(assignment, initialDate),
  );

  useEffect(() => {
    dateInputRef.current?.focus();
  }, []);

  const updateValue = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      date: values.date,
      meetingType: values.meetingType,
      section: values.section.trim(),
      title: values.title.trim(),
      participantName: values.participantName.trim(),
      assistantName: values.assistantName.trim() || undefined,
      notes: values.notes.trim() || undefined,
      startTime: values.startTime || undefined,
      durationMinutes: values.durationMinutes
        ? Number(values.durationMinutes)
        : undefined,
    });
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
        className="assignment-dialog assignment-form-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-form-title"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onClose();
          }
        }}
      >
        <header className="dialog-header">
          <div>
            <p className="dialog-eyebrow">Gerenciar designações</p>
            <h2 id="assignment-form-title">
              {assignment ? "Editar designação" : "Nova designação"}
            </h2>
          </div>
          <button
            className="icon-button dialog-close"
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <form className="assignment-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field">
              <span>Data</span>
              <input
                ref={dateInputRef}
                type="date"
                value={values.date}
                onChange={(event) => updateValue("date", event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span>Tipo de reunião</span>
              <select
                value={values.meetingType}
                onChange={(event) =>
                  updateValue(
                    "meetingType",
                    event.target.value === "weekend" ? "weekend" : "midweek",
                  )
                }
              >
                <option value="midweek">Reunião do meio de semana</option>
                <option value="weekend">Reunião do fim de semana</option>
              </select>
            </label>

            <label className="form-field">
              <span>Seção</span>
              <input
                type="text"
                value={values.section}
                onChange={(event) => updateValue("section", event.target.value)}
                maxLength={100}
                placeholder="Ex.: Faça Seu Melhor no Ministério"
                required
              />
            </label>

            <label className="form-field">
              <span>Nome da parte</span>
              <input
                type="text"
                value={values.title}
                onChange={(event) => updateValue("title", event.target.value)}
                maxLength={120}
                placeholder="Ex.: Iniciando conversas"
                required
              />
            </label>

            <label className="form-field">
              <span>Participante</span>
              <input
                type="text"
                value={values.participantName}
                onChange={(event) =>
                  updateValue("participantName", event.target.value)
                }
                maxLength={100}
                autoComplete="name"
                required
              />
            </label>

            <label className="form-field">
              <span>Ajudante <span className="optional-label">· opcional</span></span>
              <input
                type="text"
                value={values.assistantName}
                onChange={(event) =>
                  updateValue("assistantName", event.target.value)
                }
                maxLength={100}
              />
            </label>

            <label className="form-field">
              <span>Horário <span className="optional-label">· opcional</span></span>
              <input
                type="time"
                value={values.startTime}
                onChange={(event) => updateValue("startTime", event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Duração em minutos <span className="optional-label">· opcional</span></span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="240"
                step="1"
                value={values.durationMinutes}
                onChange={(event) =>
                  updateValue("durationMinutes", event.target.value)
                }
              />
            </label>

            <label className="form-field form-field--wide">
              <span>Observações <span className="optional-label">· opcional</span></span>
              <textarea
                rows={3}
                value={values.notes}
                onChange={(event) => updateValue("notes", event.target.value)}
                maxLength={500}
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary-button" type="submit">
              {assignment ? "Salvar alterações" : "Adicionar designação"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
