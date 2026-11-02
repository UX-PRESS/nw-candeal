"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/assignment";

export type AssignmentAdministrator = {
  userId: string;
  email: string;
};

function getAdministratorActionError(
  operation: "list" | "add" | "remove",
  code: string,
): string {
  console.error(`Supabase administrator ${operation} failed (${code}).`);

  if (code === "42501") {
    return "Somente administradores podem gerenciar contas administrativas.";
  }
  if (code === "P0002") {
    return operation === "add"
      ? "Não foi encontrada uma conta Supabase Auth com esse email."
      : "A conta selecionada não é mais administradora.";
  }
  if (code === "22023") {
    return "Informe um email válido de uma conta existente.";
  }
  if (code === "P0001") {
    return "Não é possível remover o último administrador.";
  }
  if (code === "PGRST202") {
    return "A migration de gerenciamento de administradores ainda não está disponível no Supabase.";
  }

  return "Não foi possível concluir a operação. Verifique a conexão e tente novamente.";
}

async function getAuthenticatedAdministratorClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      error: "Sua sessão expirou. Entre novamente para continuar.",
    };
  }

  const { data: isAdministrator, error: roleError } = await supabase.rpc(
    "is_assignment_admin",
  );

  if (roleError) {
    return {
      ok: false as const,
      error: getAdministratorActionError("list", roleError.code),
    };
  }

  if (!isAdministrator) {
    return {
      ok: false as const,
      error: "Somente administradores podem gerenciar contas administrativas.",
    };
  }

  return { ok: true as const, supabase };
}

export async function listAssignmentAdministratorsAction(): Promise<
  ActionResult<AssignmentAdministrator[]>
> {
  const access = await getAuthenticatedAdministratorClient();
  if (!access.ok) {
    return access;
  }

  const { data, error } = await access.supabase.rpc("list_assignment_admins");
  if (error || !data) {
    return {
      ok: false,
      error: getAdministratorActionError("list", error?.code ?? "UNKNOWN"),
    };
  }

  return {
    ok: true,
    data: data.map(({ user_id, email }) => ({ userId: user_id, email })),
  };
}

export async function addAssignmentAdministratorAction(
  email: string,
): Promise<ActionResult<{ administrator: AssignmentAdministrator; added: boolean }>> {
  if (typeof email !== "string" || email.trim().length > 254) {
    return { ok: false, error: "Informe um email válido de uma conta existente." };
  }

  const access = await getAuthenticatedAdministratorClient();
  if (!access.ok) {
    return access;
  }

  const { data, error } = await access.supabase.rpc(
    "add_assignment_admin_by_email",
    { target_email: email.trim() },
  );

  if (error || !data?.[0]) {
    return {
      ok: false,
      error: getAdministratorActionError("add", error?.code ?? "UNKNOWN"),
    };
  }

  return {
    ok: true,
    data: {
      administrator: {
        userId: data[0].user_id,
        email: data[0].email,
      },
      added: data[0].added,
    },
  };
}

export async function removeAssignmentAdministratorAction(
  userId: string,
): Promise<ActionResult<null>> {
  if (
    typeof userId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      userId,
    )
  ) {
    return { ok: false, error: "A conta selecionada é inválida." };
  }

  const access = await getAuthenticatedAdministratorClient();
  if (!access.ok) {
    return access;
  }

  const { data, error } = await access.supabase.rpc(
    "remove_assignment_admin",
    { target_user_id: userId },
  );

  if (error || data !== true) {
    return {
      ok: false,
      error: getAdministratorActionError("remove", error?.code ?? "UNKNOWN"),
    };
  }

  return { ok: true, data: null };
}
