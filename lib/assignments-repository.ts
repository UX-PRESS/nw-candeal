import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Assignment, AssignmentInput } from "@/types/assignment";
import type { Database } from "@/types/database";

type AssignmentRow = Database["public"]["Tables"]["assignments"]["Row"];

function mapAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    date: row.meeting_date,
    meetingType: row.meeting_type,
    section: row.section,
    title: row.title,
    participantName: row.participant_name,
    assistantName: row.assistant_name ?? undefined,
    congregationName: row.congregation_name ?? undefined,
    notes: row.notes ?? undefined,
    startTime: row.start_time?.slice(0, 5),
    durationMinutes: row.duration_minutes ?? undefined,
  };
}

function mapAssignmentInput(input: AssignmentInput) {
  return {
    meeting_date: input.date,
    meeting_type: input.meetingType,
    section: input.section,
    title: input.title,
    participant_name: input.participantName,
    assistant_name: input.assistantName ?? null,
    congregation_name: input.congregationName ?? null,
    notes: input.notes ?? null,
    start_time: input.startTime ?? null,
    duration_minutes: input.durationMinutes ?? null,
  };
}

export async function listAssignmentsByDateRange(
  supabase: SupabaseClient<Database>,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .gte("meeting_date", startDate)
    .lte("meeting_date", endDate)
    .order("meeting_date")
    .order("start_time", { nullsFirst: false });

  return {
    data: data?.map(mapAssignment) ?? null,
    error,
  };
}

export async function createAssignment(
  supabase: SupabaseClient<Database>,
  input: AssignmentInput,
) {
  const { data, error } = await supabase
    .from("assignments")
    .insert(mapAssignmentInput(input))
    .select("*")
    .single();

  return {
    data: data ? mapAssignment(data) : null,
    error,
  };
}

export async function updateAssignment(
  supabase: SupabaseClient<Database>,
  id: string,
  input: AssignmentInput,
) {
  const { data, error } = await supabase
    .from("assignments")
    .update(mapAssignmentInput(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  return {
    data: data ? mapAssignment(data) : null,
    error,
  };
}

export async function deleteAssignment(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  const { data, error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  return {
    deletedId: data?.id ?? null,
    error,
  };
}
