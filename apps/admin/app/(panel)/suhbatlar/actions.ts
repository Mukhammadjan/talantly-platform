"use server";

import { interviewSlotsRepo } from "@talantly/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";

export interface SlotFormState {
  error: string | null;
  ok: boolean;
}

export async function createSlot(
  _prev: SlotFormState,
  formData: FormData,
): Promise<SlotFormState> {
  const raw = String(formData.get("starts_at") ?? "");
  // datetime-local value, interpreted as Tashkent time (UTC+5)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:(00|30)$/.test(raw)) {
    return {
      error: "Vaqt faqat :00 yoki :30 daqiqada bo'lishi kerak.",
      ok: false,
    };
  }
  const startsAt = new Date(`${raw}:00+05:00`);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Sana noto'g'ri.", ok: false };
  }
  if (startsAt.getTime() <= Date.now()) {
    return { error: "Slot kelajakdagi vaqt bo'lishi kerak.", ok: false };
  }

  const session = await requireAdmin();
  await interviewSlotsRepo.insert(getServiceClient(), {
    starts_at: startsAt.toISOString(),
    created_by: session.user.id,
  });
  revalidatePath("/suhbatlar");
  return { error: null, ok: true };
}
