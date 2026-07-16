import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// v2 Supabase (talantly-v2) — service_role FAQAT serverda.
let client: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_V2_URL;
  const key = process.env.SUPABASE_V2_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_V2_URL yoki SUPABASE_V2_SERVICE_ROLE_KEY yo'q");
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Next.js global fetch'ni keshlaydi — DB so'rovlari HAR DOIM jonli.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return client;
}

/** Har status o'zgarishi status_log'ga yoziladi (guardrail #8). */
export async function logStatus(params: {
  entity: string;
  entityId: string;
  oldStatus: string | null;
  newStatus: string;
  changedBy: string;
}): Promise<void> {
  const { error } = await getDb().from("status_log").insert({
    entity: params.entity,
    entity_id: params.entityId,
    old_status: params.oldStatus,
    new_status: params.newStatus,
    changed_by: params.changedBy,
  });
  if (error) throw new Error(`status_log insert failed: ${error.message}`);
}
