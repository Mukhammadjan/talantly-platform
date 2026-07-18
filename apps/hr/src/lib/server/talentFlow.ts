import { statusMachine } from "@talantly/shared";
import { getDb } from "./db";

// Talant status o'tishlari — webapp bilan bir xil YAGONA holat mashinasi
// (packages/shared/statusMachine). To'g'ridan-to'g'ri status yozish YO'Q.

export interface TalentStatusRow {
  id: string;
  status: string;
}

async function getSetting(key: string): Promise<string | null> {
  const { data } = await getDb()
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return (data as { value: string } | null)?.value ?? null;
}

export async function getSettingInt(
  key: string,
  fallback: number,
): Promise<number> {
  const n = Number(await getSetting(key));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Hodisa → statusMachine → status + status_log. Noto'g'ri o'tish = null. */
export async function applyEvent(
  talent: TalentStatusRow,
  event: statusMachine.TalantEvent,
  changedBy: string,
): Promise<string | null> {
  const cvPaymentRequired =
    ((await getSetting("cv_payment_required")) ?? "true").toLowerCase() ===
    "true";
  const r = statusMachine.nextStatus(
    talent.status as statusMachine.TalantStatus,
    event,
    { cvPaymentRequired },
  );
  if (!r.ok) return null;
  if (talent.status === r.next) return r.next;

  const db = getDb();
  const { error } = await db
    .from("talents")
    .update({ status: r.next })
    .eq("id", talent.id);
  if (error) throw new Error(`talent status update failed: ${error.message}`);
  const { error: logErr } = await db.from("status_log").insert({
    entity: "talents",
    entity_id: talent.id,
    old_status: talent.status,
    new_status: r.next,
    changed_by: changedBy,
  });
  if (logErr) throw new Error(`status_log insert failed: ${logErr.message}`);
  return r.next;
}

export async function logEntityStatus(row: {
  entity: string;
  entityId: string;
  oldStatus: string | null;
  newStatus: string;
  changedBy: string;
}): Promise<void> {
  const { error } = await getDb().from("status_log").insert({
    entity: row.entity,
    entity_id: row.entityId,
    old_status: row.oldStatus,
    new_status: row.newStatus,
    changed_by: row.changedBy,
  });
  if (error) throw new Error(`status_log insert failed: ${error.message}`);
}
