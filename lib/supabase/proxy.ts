import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnvironment } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export async function updateSupabaseSession(request: NextRequest) {
  const environment = getSupabaseEnvironment();

  if (!environment) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(
    environment.url,
    environment.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          response.headers.set("Cache-Control", "private, no-store");
          response.headers.set("Expires", "0");
          response.headers.set("Pragma", "no-cache");
        },
      },
    },
  );

  await supabase.auth.getClaims();

  return response;
}
