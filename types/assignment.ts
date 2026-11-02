export type MeetingType = "midweek" | "weekend";

export type Assignment = {
  id: string;
  date: string;
  meetingType: MeetingType;
  section: string;
  title: string;
  participantName: string;
  assistantName?: string;
  congregationName?: string;
  notes?: string;
  startTime?: string;
  durationMinutes?: number;
};

export type AssignmentInput = Omit<Assignment, "id">;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
