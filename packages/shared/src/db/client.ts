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
    },
  });
}
