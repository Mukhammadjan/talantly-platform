"use server";

import { talentsRepo } from "@talantly/shared";
import { revalidatePath } from "next/cache";
import { requirePanel } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { logStatus } from "@/lib/log";
import { REJECT_LABELS, type RejectReason } from "./reasons";

export interface Result {
  ok: boolean;
  error?: string;
}

function revalidate(): void {
  revalidatePath("/tekshiruv");
  revalidatePath("/talantlar");
  revalidatePath("/dashboard");
}

/** Tasdiqlash → tekshirilgan (+ verified_at). Moderator + admin. */
export async function approveTalent(talentId: string): Promise<Result> {
  const { user } = await requirePanel();
  const db = getServiceClient();
  const talent = await talentsRepo.findById(db, talentId);
  if (!talent) return { ok: false, error: "Topilmadi" };
  if (talent.status === "tekshirilgan") return { ok: true };

  await talentsRepo.setStatus(db, talent, "tekshirilgan", user.id, {
    verified_at: new Date().toISOString(),
  });
  revalidate();
  return { ok: true };
}

/** Rad etish → rad_etilgan. Sabab MAJBURIY, audit'ga yoziladi. */
export async function rejectTalent(
  talentId: string,
  reason: RejectReason,
  note: string,
): Promise<Result> {
  const { user } = await requirePanel();
  if (!REJECT_LABELS[reason]) return { ok: false, error: "Sabab tanlang" };

  const db = getServiceClient();
  const talent = await talentsRepo.findById(db, talentId);
  if (!talent) return { ok: false, error: "Topilmadi" };

  await talentsRepo.setStatus(db, talent, "rad_etilgan", user.id, {
    verified_at: null,
  });
  // Sababni audit izohi sifatida yozamiz (status_log note ustuni yo'q).
  const detail = note.trim()
    ? `${REJECT_LABELS[reason]} — ${note.trim()}`
    : REJECT_LABELS[reason];
  await logStatus({
    entity: "talent",
    entityId: talentId,
    oldStatus: "rad_etilgan",
    newStatus: `sabab: ${detail}`.slice(0, 200),
    changedBy: user.id,
  });
  revalidate();
  return { ok: true };
}
