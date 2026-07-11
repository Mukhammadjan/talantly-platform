import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.js";

export type TalantlyClient = SupabaseClient<Database>;

export function createServiceClient(
  url: string,
  serviceRoleKey: string,
): TalantlyClient {
  if (!url) throw new Error("createServiceClient: url is required");
  if (!serviceRoleKey) {
    throw new Error("createServiceClient: serviceRoleKey is required");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { "X-Client-Info": "talantly-service" },
      // Next.js App Router caches fetch() GET requests in its Data Cache by
      // default, which makes supabase reads inside GET route handlers serve
      // stale rows (e.g. /api/me, /api/feed returning pre-update data).
      // Force no-store so every DB read/write hits Postgres fresh.
      fetch: (input, init) =>
        // `cache` is valid at runtime (undici / Next fetch) but absent from the
        // narrow RequestInit type available here without the DOM lib.
        fetch(input, { ...init, cache: "no-store" } as RequestInit),
    },
  });
}
