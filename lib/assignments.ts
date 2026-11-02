import { isDateInWeek } from "@/lib/dates";
import type { Assignment, MeetingType } from "@/types/assignment";

export type MeetingGroup = {
  date: string;
  meetingType: MeetingType;
  assignments: Assignment[];
};

export function sortAssignments(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort((first, second) => {
    const firstTime = `${first.date}T${first.startTime ?? "00:00"}`;
    const secondTime = `${second.date}T${second.startTime ?? "00:00"}`;
    return firstTime.localeCompare(secondTime) || first.title.localeCompare(second.title);
  });
}

export function getAssignmentsForWeek(
  assignments: Assignment[],
  weekStart: Date,
): Assignment[] {
  return sortAssignments(
    assignments.filter((assignment) => isDateInWeek(assignment.date, weekStart)),
  );
}

export function groupAssignmentsByMeeting(
  assignments: Assignment[],
): MeetingGroup[] {
  const groups = new Map<string, MeetingGroup>();

  for (const assignment of sortAssignments(assignments)) {
    const key = `${assignment.date}:${assignment.meetingType}`;
    const group = groups.get(key);

    if (group) {
      group.assignments.push(assignment);
    } else {
      groups.set(key, {
        date: assignment.date,
        meetingType: assignment.meetingType,
        assignments: [assignment],
      });
    }
  }

  return [...groups.values()];
}

export function getNextAssignment(
  assignments: Assignment[],
  selectedWeekStart: Date,
  currentWeekStart: Date,
  currentDateTime: Date,
): Assignment | undefined {
  const meetings = groupAssignmentsByMeeting(assignments);

  if (selectedWeekStart < currentWeekStart) {
    return undefined;
  }

  if (selectedWeekStart > currentWeekStart) {
    return meetings[0]?.assignments[0];
  }

  return meetings.find((meeting) => {
    const firstAssignment = meeting.assignments[0];
    const meetingDateTime = new Date(
      `${firstAssignment.date}T${firstAssignment.startTime ?? "00:00"}`,
    );
    return meetingDateTime >= currentDateTime;
  })?.assignments[0];
}
