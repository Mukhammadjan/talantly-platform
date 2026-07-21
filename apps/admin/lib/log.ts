import "server-only";
import { getServiceClient } from "@/lib/supabase/service";

/** Har admin/moderator amali status_log'ga yoziladi (audit — §6, guardrail #8). */
export async function logStatus(params: {
  entity: string;
  entityId: string;
  oldStatus: string | null;
  newStatus: string;
  changedBy: string;
}): Promise<void> {
  const { error } = await getServiceClient().from("status_log").insert({
    entity: params.entity,
    entity_id: params.entityId,
    old_status: params.oldStatus,
    new_status: params.newStatus,
    changed_by: params.changedBy,
  });
  if (error) throw new Error(`status_log insert failed: ${error.message}`);
}
