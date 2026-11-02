import { Suspense } from "react";
import { connection } from "next/server";

import { WeeklyDashboard } from "@/components/WeeklyDashboard";
import { getStartOfWeek, toDateKey } from "@/lib/dates";

async function CurrentWeekDashboard() {
  await connection();

  const currentDateTime = new Date();

  return (
    <WeeklyDashboard
      initialWeekStart={toDateKey(getStartOfWeek(currentDateTime))}
      initialDateTime={currentDateTime.toISOString()}
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
      <CurrentWeekDashboard />
    </Suspense>
  );
}
