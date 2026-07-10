"use server";

import type { TalentStatus } from "@talantly/shared";
import { skillTestsRepo, talentsRepo } from "@talantly/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { STATUS_ORDER } from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";

async function loadTalent(talentId: string) {
  const session = await requireAdmin();
  const client = getServiceClient();
  const talent = await talentsRepo.findById(client, talentId);
  if (!talent) throw new Error(`Talent ${talentId} topilmadi`);
  return { session, client, talent };
}

function revalidate(talentId: string) {
  revalidatePath(`/talantlar/${talentId}`);
  revalidatePath("/talantlar");
  revalidatePath("/dashboard");
}

export async function forceStatus(formData: FormData): Promise<void> {
  const talentId = String(formData.get("talentId") ?? "");
  const newStatus = String(formData.get("status") ?? "") as TalentStatus;
  if (!STATUS_ORDER.includes(newStatus)) {
    throw new Error(`Noto'g'ri status: ${newStatus}`);
  }

  const { session, client, talent } = await loadTalent(talentId);
  if (talent.status === newStatus) return;

  await talentsRepo.setStatus(client, talent, newStatus, session.user.id, {
    verified_at:
      newStatus === "tekshirilgan" ? new Date().toISOString() : null,
  });
  revalidate(talentId);
}

export async function resetTest(formData: FormData): Promise<void> {
  const talentId = String(formData.get("talentId") ?? "");
  const { session, client, talent } = await loadTalent(talentId);

  await skillTestsRepo.deleteByTalentId(client, talentId);
  if (talent.status === "test_otgan") {
    await talentsRepo.setStatus(client, talent, "cv_tayyor", session.user.id);
  }
  revalidate(talentId);
}

export async function grantSeal(formData: FormData): Promise<void> {
  const talentId = String(formData.get("talentId") ?? "");
  const { session, client, talent } = await loadTalent(talentId);
  if (talent.status === "tekshirilgan") return;

  await talentsRepo.setStatus(client, talent, "tekshirilgan", session.user.id, {
    verified_at: new Date().toISOString(),
  });
  revalidate(talentId);
}

export async function revokeSeal(formData: FormData): Promise<void> {
  const talentId = String(formData.get("talentId") ?? "");
  const { session, client, talent } = await loadTalent(talentId);
  if (talent.status !== "tekshirilgan") return;

  await talentsRepo.setStatus(
    client,
    talent,
    "suhbat_belgilangan",
    session.user.id,
    { verified_at: null },
  );
  revalidate(talentId);
}
