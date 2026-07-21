"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";

const NUMERIC_KEYS = [
  "cv_price",
  "contact_unlock_price",
  "subscription_price",
  "success_fee_intern",
  "success_fee_mutaxassis",
  "success_fee_tech",
] as const;

const TEXT_KEYS = ["payment_card_number", "payment_card_owner"] as const;
const BOOL_KEYS = ["show_demo_data", "cv_payment_required"] as const;

export interface SaveState {
  ok: boolean;
  error: string | null;
}

/** Sozlamalarni saqlash — faqat admin. Har o'zgargan kalit yangilanadi. */
export async function saveSettings(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  await requireRole("admin");
  const db = getServiceClient();

  const updates: { key: string; value: string }[] = [];

  for (const key of NUMERIC_KEYS) {
    const raw = String(formData.get(key) ?? "").replace(/\s/g, "");
    if (!/^\d+$/.test(raw)) {
      return { ok: false, error: `Noto'g'ri raqam: ${key}` };
    }
    updates.push({ key, value: raw });
  }
  for (const key of TEXT_KEYS) {
    updates.push({ key, value: String(formData.get(key) ?? "").trim() });
  }
  for (const key of BOOL_KEYS) {
    updates.push({ key, value: formData.get(key) === "on" ? "true" : "false" });
  }

  for (const u of updates) {
    const { error } = await db
      .from("settings")
      .update({ value: u.value })
      .eq("key", u.key);
    if (error) {
      return { ok: false, error: `Saqlashda xato: ${u.key}` };
    }
  }

  revalidatePath("/sozlamalar");
  return { ok: true, error: null };
}
