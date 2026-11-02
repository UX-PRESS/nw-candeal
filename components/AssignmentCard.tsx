"use client";

import { Clock3, UserRound, UsersRound } from "lucide-react";

import type { Assignment } from "@/types/assignment";

type AssignmentCardProps = {
  assignment: Assignment;
  onSelect: (assignment: Assignment) => void;
};

export function AssignmentCard({ assignment, onSelect }: AssignmentCardProps) {
  const duration = assignment.durationMinutes
    ? `${assignment.durationMinutes} min`
    : undefined;

  return (
    <button
      className="assignment-card"
      type="button"
      onClick={() => onSelect(assignment)}
      aria-label={`Ver detalhes de ${assignment.title}, com ${assignment.participantName}`}
    >
      <span className="assignment-section">{assignment.section}</span>
      <span className="assignment-title">{assignment.title}</span>

      <span className="assignment-person">
        <UserRound aria-hidden="true" size={16} />
        {assignment.title === "Orador + Congregação"
          ? `Orador: ${assignment.participantName}`
          : assignment.participantName}
      </span>

      {assignment.congregationName ? (
        <span className="assignment-assistant">
          Congregação: {assignment.congregationName}
        </span>
      ) : null}

      {assignment.assistantName ? (
        <span className="assignment-assistant">
          <UsersRound aria-hidden="true" size={15} />
          Ajudante: {assignment.assistantName}
        </span>
      ) : null}

      {assignment.startTime || duration ? (
        <span className="assignment-meta">
          <Clock3 aria-hidden="true" size={15} />
          {[assignment.startTime, duration].filter(Boolean).join(" · ")}
        </span>
      ) : null}
    </button>
  );
}
