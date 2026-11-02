export type MeetingType = "midweek" | "weekend";

export type Assignment = {
  id: string;
  date: string;
  meetingType: MeetingType;
  section: string;
  title: string;
  participantName: string;
  assistantName?: string;
  notes?: string;
  startTime?: string;
  durationMinutes?: number;
};
