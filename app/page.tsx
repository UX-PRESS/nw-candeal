import { Suspense } from "react";
import { connection } from "next/server";

import { AccessGate, SupabaseSetupNotice } from "@/components/AccessGate";
import { WeeklyDashboard } from "@/components/WeeklyDashboard";
import { listAssignmentsByDateRange } from "@/lib/assignments-repository";
import { getAssignmentDatabaseErrorMessage } from "@/lib/assignments-errors";
import {
  getWeekEnd,
  getStartOfWeek,
  toDateKey,
} from "@/lib/dates";
import { getSupabaseEnvironment } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function RequestDashboard() {
  await connection();

  if (!getSupabaseEnvironment()) {
    return <SupabaseSetupNotice />;
  }

  const supabase = await createSupabaseServerClient();
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
  let authenticationError: Awaited<
    ReturnType<typeof supabase.auth.getUser>
  >["error"];

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
    authenticationError = result.error;
  } catch {
    return (
      <AccessGate message="Não foi possível verificar sua sessão. Confira a conexão e tente novamente." />
    );
  }

  if (
    authenticationError &&
    authenticationError.name !== "AuthSessionMissingError"
  ) {
    console.error(
      `Supabase user verification failed (${authenticationError.status ?? "unknown"}).`,
    );
    return (
      <AccessGate message="Não foi possível verificar sua sessão. Confira a conexão e tente novamente." />
    );
  }

  if (!user) {
    return <AccessGate />;
  }

  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const weekStartKey = toDateKey(weekStart);
  const weekEndKey = toDateKey(getWeekEnd(weekStart));

  const [assignmentsOutcome, administratorOutcome] = await Promise.allSettled([
    listAssignmentsByDateRange(supabase, weekStartKey, weekEndKey),
    supabase.rpc("is_assignment_admin"),
  ]);

  const assignmentsResult =
    assignmentsOutcome.status === "fulfilled"
      ? assignmentsOutcome.value
      : null;
  const administratorResult =
    administratorOutcome.status === "fulfilled"
      ? administratorOutcome.value
      : null;

  if (assignmentsOutcome.status === "rejected") {
    console.error("Supabase assignment list request failed.");
  }
  if (administratorOutcome.status === "rejected") {
    console.error("Supabase administrator check request failed.");
  }

  const initialLoadError = assignmentsResult?.error
    ? getAssignmentDatabaseErrorMessage("load", assignmentsResult.error.code)
    : assignmentsResult
      ? null
      : "Não foi possível carregar as designações. Verifique a conexão e tente novamente.";
  const permissionError =
    administratorResult?.error || !administratorResult
      ? "Não foi possível verificar sua permissão de administrador. Execute a migration de segurança do Supabase."
      : null;

  if (administratorResult?.error) {
    console.error(
      `Supabase administrator check failed (${administratorResult.error.code}).`,
    );
  }

  return (
    <WeeklyDashboard
      initialWeekStart={weekStartKey}
      initialDateTime={now.toISOString()}
      initialAssignments={assignmentsResult?.data ?? []}
      initialLoadError={initialLoadError}
      permissionError={permissionError}
      isAdministrator={administratorResult?.data === true}
      userEmail={user.email ?? "Conta autenticada"}
    />
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="app-shell">
          <p className="loading-state" role="status">
            Carregando agenda semanal...
          </p>
        </main>
      }
    >
      <RequestDashboard />
    </Suspense>
  );
}
