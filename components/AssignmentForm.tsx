"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import { listParticipantsForAssignmentAction } from "@/app/actions/assignments";
import {
  getPartOptions,
  getSectionOptions,
  WEEKEND_SECTION,
} from "@/lib/meeting-program";
import type {
  ActionResult,
  Assignment,
  AssignmentInput,
  MeetingType,
} from "@/types/assignment";

type AssignmentFormProps = {
  assignment: Assignment | null;
  initialDate: string;
  onClose: () => void;
  onSave: (assignment: AssignmentInput) => Promise<ActionResult<Assignment>>;
};

type FormValues = {
  date: string;
  meetingType: MeetingType | "";
  section: string;
  title: string;
  participantName: string;
  assistantName: string;
  congregationName: string;
  notes: string;
  startTime: string;
  durationMinutes: string;
};

function createFormValues(assignment: Assignment | null, initialDate: string): FormValues {
  return {
    date: assignment?.date ?? initialDate,
    meetingType: assignment?.meetingType ?? "",
    section: assignment?.section ?? "",
    title: assignment?.title ?? "",
    participantName: assignment?.participantName ?? "",
    assistantName: assignment?.assistantName ?? "",
    congregationName: assignment?.congregationName ?? "",
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
  const meetingTypeInputRef = useRef<HTMLSelectElement>(null);
  const [values, setValues] = useState(() =>
    createFormValues(assignment, initialDate),
  );
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    meetingTypeInputRef.current?.focus();
  }, []);

  const refreshParticipants = async () => {
    setParticipantsLoading(true);
    setParticipantsError(null);

    try {
      const result = await listParticipantsForAssignmentAction();
      if (!result.ok) {
        setParticipantsError(result.error);
        return;
      }

      setParticipants(result.data);
    } catch {
      setParticipantsError(
        "Não foi possível carregar os participantes. Verifique a conexão e tente novamente.",
      );
    } finally {
      setParticipantsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    void listParticipantsForAssignmentAction()
      .then((result) => {
        if (!isCurrent) {
          return;
        }
        if (!result.ok) {
          setParticipantsError(result.error);
          return;
        }

        setParticipants(result.data);
      })
      .catch(() => {
        if (isCurrent) {
          setParticipantsError(
            "Não foi possível carregar os participantes. Verifique a conexão e tente novamente.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setParticipantsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const participantOptions = [
    ...new Set([
      ...participants,
      ...(assignment?.participantName ? [assignment.participantName] : []),
      ...(assignment?.assistantName ? [assignment.assistantName] : []),
    ]),
  ].sort((first, second) => first.localeCompare(second, "pt-BR"));

  const updateValue = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) => {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.meetingType) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const result = await onSave({
        date: values.date,
        meetingType: values.meetingType,
        section:
          values.meetingType === "weekend"
            ? values.section.trim() || WEEKEND_SECTION
            : values.section.trim(),
        title: values.title.trim(),
        participantName: values.participantName.trim(),
        assistantName: values.assistantName.trim() || undefined,
        congregationName: values.congregationName.trim() || undefined,
        notes: values.notes.trim() || undefined,
        startTime: values.startTime || undefined,
        durationMinutes: values.durationMinutes
          ? Number(values.durationMinutes)
          : undefined,
      });

      if (!result.ok) {
        setSaveError(result.error);
      }
    } catch {
      setSaveError("Não foi possível salvar. Verifique a conexão e tente novamente.");
    } finally {
      setIsSaving(false);
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
              <span>Tipo de reunião</span>
              <select
                ref={meetingTypeInputRef}
                value={values.meetingType}
                onChange={(event) => {
                  const meetingType =
                    event.target.value === "weekend" ? "weekend" : "midweek";
                  setValues((currentValues) => ({
                    ...currentValues,
                    meetingType,
                    section: meetingType === "weekend" ? WEEKEND_SECTION : "",
                    title: "",
                    congregationName: "",
                  }));
                }}
                required
              >
                <option value="" disabled>
                  Selecione a modalidade
                </option>
                <option value="midweek">Reunião do meio de semana</option>
                <option value="weekend">Reunião do fim de semana</option>
              </select>
            </label>

            {values.meetingType ? (
              <>
                <label className="form-field">
                  <span>Data</span>
                  <input
                    type="date"
                    value={values.date}
                    onChange={(event) => updateValue("date", event.target.value)}
                    required
                  />
                </label>

                {values.meetingType === "midweek" ? (
                  <label className="form-field">
                    <span>Seção</span>
                    <select
                      value={values.section}
                      onChange={(event) => {
                        setValues((currentValues) => ({
                          ...currentValues,
                          section: event.target.value,
                          title: "",
                          congregationName: "",
                        }));
                      }}
                      required
                    >
                      <option value="" disabled>
                        Selecione uma seção
                      </option>
                      {getSectionOptions("midweek", values.section).map(
                        (section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                ) : null}

                <label className="form-field">
                  <span>
                    {values.meetingType === "midweek"
                      ? "Tipo de participação"
                      : "Designação"}
                  </span>
                  <select
                    value={values.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setValues((currentValues) => ({
                        ...currentValues,
                        title,
                        congregationName:
                          title === "Orador + Congregação"
                            ? currentValues.congregationName
                            : "",
                      }));
                    }}
                    required
                  >
                    <option value="" disabled>
                      {values.meetingType === "midweek"
                        ? "Selecione o tipo de participação"
                        : "Selecione uma designação"}
                    </option>
                    {getPartOptions(
                      values.meetingType,
                      values.section,
                      values.title,
                    ).map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </label>

                {values.meetingType === "weekend" &&
                values.title === "Orador + Congregação" ? (
                  <label className="form-field">
                    <span>Congregação representada</span>
                    <input
                      type="text"
                      value={values.congregationName}
                      onChange={(event) =>
                        updateValue("congregationName", event.target.value)
                      }
                      maxLength={120}
                      required
                    />
                  </label>
                ) : null}

                <label className="form-field">
                  <span>
                    {values.meetingType === "weekend" &&
                    values.title === "Orador + Congregação"
                      ? "Orador"
                      : "Participante"}
                  </span>
                  <select
                    value={values.participantName}
                    onChange={(event) =>
                      updateValue("participantName", event.target.value)
                    }
                    disabled={participantsLoading}
                    required
                  >
                    <option value="" disabled>
                      {participantsLoading
                        ? "Carregando participantes..."
                        : participants.length > 0
                          ? "Selecione um participante"
                          : "Nenhum participante cadastrado"}
                    </option>
                    {participantOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                        {!participants.includes(name)
                          ? " (mantido do registro)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-field">
                  <span>
                    Ajudante <span className="optional-label">· opcional</span>
                  </span>
                  <select
                    value={values.assistantName}
                    onChange={(event) =>
                      updateValue("assistantName", event.target.value)
                    }
                    disabled={participantsLoading}
                  >
                    <option value="">Sem ajudante</option>
                    {participantOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                        {!participants.includes(name)
                          ? " (mantido do registro)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}

            {participantsError ? (
              <p
                className="status-message status-message--error form-field--wide"
                role="alert"
              >
                {participantsError}{" "}
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void refreshParticipants()}
                  disabled={participantsLoading}
                >
                  Tentar novamente
                </button>
              </p>
            ) : null}

            {values.meetingType ? <label className="form-field">
              <span>Horário <span className="optional-label">· opcional</span></span>
              <input
                type="time"
                value={values.startTime}
                onChange={(event) => updateValue("startTime", event.target.value)}
              />
            </label> : null}

            {values.meetingType ? <label className="form-field">
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
            </label> : null}

            {values.meetingType ? <label className="form-field form-field--wide">
              <span>Observações <span className="optional-label">· opcional</span></span>
              <textarea
                rows={3}
                value={values.notes}
                onChange={(event) => updateValue("notes", event.target.value)}
                maxLength={500}
              />
            </label> : null}
          </div>

          <div className="form-actions">
            {saveError ? (
              <p className="status-message status-message--error" role="alert">
                {saveError}
              </p>
            ) : null}
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving
                ? "Salvando..."
                : assignment
                  ? "Salvar alterações"
                  : "Adicionar designação"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
