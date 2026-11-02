import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export async function listParticipants(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("participants")
    .select("name")
    .order("name");

  return {
    data: data?.map(({ name }) => name.trim()).filter(Boolean) ?? null,
    error,
  };
}
