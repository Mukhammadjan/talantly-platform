import { createServiceClient, type TalantlyClient } from "@talantly/shared";
import { config } from "../config.js";

let clientInstance: TalantlyClient | undefined;

export function getSupabase(): TalantlyClient {
  if (!clientInstance) {
    clientInstance = createServiceClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey,
    );
  }
  return clientInstance;
}
