import "server-only";
import { createServiceClient, type TalantlyClient } from "@talantly/shared";
import { serverEnv } from "@/lib/env";

let cached: TalantlyClient | null = null;

/** Service-role client for data access. NEVER import from client components. */
export function getServiceClient(): TalantlyClient {
  if (!cached) {
    cached = createServiceClient(
      serverEnv.supabaseUrl,
      serverEnv.supabaseServiceRoleKey,
    );
  }
  return cached;
}
