"use client";

import { CalendarClock, Landmark } from "lucide-react";

import { AssignmentCard } from "@/components/AssignmentCard";
import { formatFullDate } from "@/lib/dates";
import type { Assignment, MeetingType } from "@/types/assignment";

type MeetingSectionProps = {
  meetingType: MeetingType;
  date: string;
  assignments: Assignment[];
  onSelect: (assignment: Assignment) => void;
};

const meetingLabels: Record<MeetingType, string> = {
  midweek: "Reunião do meio de semana",
  weekend: "Reunião do fim de semana",
};

export function MeetingSection({
  meetingType,
  date,
  assignments,
  onSelect,
}: MeetingSectionProps) {
  const headingId = `${meetingType}-meeting-${date}`;

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
          <p>{formatFullDate(date)}</p>
        </div>
        <span className="assignment-count">
          {assignments.length} {assignments.length === 1 ? "item" : "itens"}
        </span>
      </header>

      <div className="assignment-list">
        {assignments.map((assignment) => (
          <AssignmentCard
            assignment={assignment}
            key={assignment.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
