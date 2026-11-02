"use server";

import { isValidDateKey, addDays, getStartOfWeek, toDateKey } from "@/lib/dates";
import {
  createAssignment as insertAssignment,
  deleteAssignment as removeAssignment,
  listAssignmentsByDateRange,
  updateAssignment as saveAssignment,
} from "@/lib/assignments-repository";
import { getAssignmentDatabaseErrorMessage } from "@/lib/assignments-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult, Assignment, AssignmentInput } from "@/types/assignment";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAssignmentInput(value: unknown): AssignmentInput | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    date,
    meetingType,
    section,
    title,
    participantName,
    assistantName,
    notes,
    startTime,
    durationMinutes,
  } = value;

  if (
    typeof date !== "string" ||
    !isValidDateKey(date) ||
    (meetingType !== "midweek" && meetingType !== "weekend") ||
    typeof section !== "string" ||
    !section.trim() ||
    section.length > 100 ||
    typeof title !== "string" ||
    !title.trim() ||
    title.length > 120 ||
    typeof participantName !== "string" ||
    !participantName.trim() ||
    participantName.length > 100 ||
    (assistantName !== undefined &&
      assistantName !== null &&
      (typeof assistantName !== "string" || assistantName.length > 100)) ||
    (notes !== undefined &&
      notes !== null &&
      (typeof notes !== "string" || notes.length > 500)) ||
    (startTime !== undefined &&
      startTime !== null &&
      (typeof startTime !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime))) ||
    (durationMinutes !== undefined &&
      durationMinutes !== null &&
      (typeof durationMinutes !== "number" ||
        !Number.isInteger(durationMinutes) ||
        durationMinutes < 1 ||
        durationMinutes > 240))
  ) {
    return null;
  }

  return {
    date,
    meetingType,
    section: section.trim(),
    title: title.trim(),
    participantName: participantName.trim(),
    assistantName:
      typeof assistantName === "string" && assistantName.trim()
        ? assistantName.trim()
        : undefined,
    notes: typeof notes === "string" && notes.trim() ? notes.trim() : undefined,
    startTime: typeof startTime === "string" ? startTime : undefined,
    durationMinutes:
      typeof durationMinutes === "number" ? durationMinutes : undefined,
  };
}

async function getAuthenticatedClient(
  requireAdministrator: boolean,
): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> }
  | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      error: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  if (requireAdministrator) {
    const { data: isAdministrator, error } = await supabase.rpc(
      "is_assignment_admin",
    );

    if (error) {
      return {
        ok: false,
        error: getAssignmentDatabaseErrorMessage("load", error.code),
      };
    }

    if (!isAdministrator) {
      return {
        ok: false,
        error: "Somente administradores podem alterar as designações.",
      };
    }
  }

  return { ok: true, supabase };
}

export async function listAssignmentsForWeekAction(
  weekStart: string,
): Promise<ActionResult<Assignment[]>> {
  if (!isValidDateKey(weekStart)) {
    return { ok: false, error: "A semana selecionada é inválida." };
  }

  const weekStartDate = new Date(`${weekStart}T00:00:00`);
  if (toDateKey(getStartOfWeek(weekStartDate)) !== weekStart) {
    return { ok: false, error: "A semana selecionada deve começar na segunda-feira." };
  }

  const user = await getAuthenticatedClient(false);
  if (!user.ok) {
    return user;
  }

  const weekEnd = toDateKey(addDays(weekStartDate, 6));
  const { data, error } = await listAssignmentsByDateRange(
    user.supabase,
    weekStart,
    weekEnd,
  );

  if (error || !data) {
    return {
      ok: false,
      error: getAssignmentDatabaseErrorMessage(
        "load",
        error?.code ?? "UNKNOWN",
      ),
    };
  }

  return { ok: true, data };
}

export async function createAssignmentAction(
  value: unknown,
): Promise<ActionResult<Assignment>> {
  const input = parseAssignmentInput(value);
  if (!input) {
    return { ok: false, error: "Confira os campos da designação e tente novamente." };
  }

  const user = await getAuthenticatedClient(true);
  if (!user.ok) {
    return user;
  }

  const { data, error } = await insertAssignment(user.supabase, input);
  if (error || !data) {
    return {
      ok: false,
      error: getAssignmentDatabaseErrorMessage(
        "save",
        error?.code ?? "UNKNOWN",
      ),
    };
  }

  return { ok: true, data };
}

export async function updateAssignmentAction(
  id: string,
  value: unknown,
): Promise<ActionResult<Assignment>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "A designação selecionada é inválida." };
  }

  const input = parseAssignmentInput(value);
  if (!input) {
    return { ok: false, error: "Confira os campos da designação e tente novamente." };
  }

  const user = await getAuthenticatedClient(true);
  if (!user.ok) {
    return user;
  }

  const { data, error } = await saveAssignment(user.supabase, id, input);
  if (error) {
    return {
      ok: false,
      error: getAssignmentDatabaseErrorMessage("save", error.code),
    };
  }
  if (!data) {
    return { ok: false, error: "A designação não foi encontrada ou já foi excluída." };
  }

  return { ok: true, data };
}

export async function deleteAssignmentAction(
  id: string,
): Promise<ActionResult<null>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "A designação selecionada é inválida." };
  }

  const user = await getAuthenticatedClient(true);
  if (!user.ok) {
    return user;
  }

  const { deletedId, error } = await removeAssignment(user.supabase, id);
  if (error) {
    return {
      ok: false,
      error: getAssignmentDatabaseErrorMessage("save", error.code),
    };
  }
  if (!deletedId) {
    return { ok: false, error: "A designação não foi encontrada ou já foi excluída." };
  }

  return { ok: true, data: null };
}
