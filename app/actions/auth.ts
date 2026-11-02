"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/assignment";

export type LoginFormState = {
  error?: string;
};

export async function signInWithPassword(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 256
  ) {
    return { error: "Informe um email válido e sua senha." };
  }

  const supabase = await createSupabaseServerClient();
  let hasError = false;
  let errorStatus: number | undefined;
  try {
    const result = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    hasError = result.error !== null;
    errorStatus = result.error?.status;
  } catch {
    return {
      error: "Não foi possível conectar ao serviço de autenticação. Tente novamente.",
    };
  }

  if (hasError) {
    console.error(`Supabase sign-in failed (${errorStatus ?? "unknown"}).`);
    return {
      error: "Não foi possível entrar. Verifique suas credenciais e tente novamente.",
    };
  }

  redirect("/");
}

export async function signOut(): Promise<ActionResult<null>> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error(`Supabase sign-out failed (${error.status ?? "unknown"}).`);
    return {
      ok: false,
      error: "Não foi possível encerrar a sessão. Tente novamente.",
    };
  }

  redirect("/");
}
