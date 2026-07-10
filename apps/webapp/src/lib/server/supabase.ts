import { createServiceClient, type TalantlyClient } from "@talantly/shared";
import { serverEnv } from "./env";

let client: TalantlyClient | undefined;

export function getSupabase(): TalantlyClient {
  if (!client) {
    client = createServiceClient(
      serverEnv.supabaseUrl,
      serverEnv.supabaseServiceRoleKey,
    );
  }
  return client;
}
