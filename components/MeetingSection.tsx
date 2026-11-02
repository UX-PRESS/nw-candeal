"use client";

import { CalendarClock, Landmark } from "lucide-react";

import { AssignmentCard } from "@/components/AssignmentCard";
import { formatMeetingDate } from "@/lib/dates";
import type { Assignment, MeetingType } from "@/types/assignment";

type MeetingSectionProps = {
  meetingType: MeetingType;
  assignments: Assignment[];
  onSelect: (assignment: Assignment) => void;
};

const meetingLabels: Record<MeetingType, string> = {
  midweek: "Reunião do meio de semana",
  weekend: "Reunião do fim de semana",
};

export function MeetingSection({
  meetingType,
  assignments,
  onSelect,
}: MeetingSectionProps) {
  const firstAssignment = assignments[0];
  const headingId = `${meetingType}-meeting-heading`;

  return (
    <section
      className={`meeting-section meeting-section--${meetingType}`}
      aria-labelledby={headingId}
    >
      <header className="meeting-section-header">
        <div className="meeting-icon" aria-hidden="true">
          {meetingType === "midweek" ? (
            <CalendarClock size={20} />
          ) : (
            <Landmark size={20} />
          )}
        </div>
        <div>
          <h2 id={headingId}>{meetingLabels[meetingType]}</h2>
          {firstAssignment ? (
            <p>
              {formatMeetingDate(firstAssignment.date)} · {firstAssignment.startTime}
            </p>
          ) : (
            <p>Nenhuma designação nesta reunião</p>
          )}
        </div>
        <span className="assignment-count">
          {assignments.length} {assignments.length === 1 ? "item" : "itens"}
        </span>
      </header>

      {assignments.length > 0 ? (
        <div className="assignment-list">
          {assignments.map((assignment) => (
            <AssignmentCard
              assignment={assignment}
              key={assignment.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <p className="meeting-empty">Não há designações cadastradas para esta reunião.</p>
      )}
    </section>
  );
}
