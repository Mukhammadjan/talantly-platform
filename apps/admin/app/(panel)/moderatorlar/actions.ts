"use server";

import { auth } from "@talantly/shared";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { logStatus } from "@/lib/log";

export interface AssignState {
  ok: boolean;
  error: string | null;
  note: string | null;
}

/**
 * Mavjud foydalanuvchini moderatorga tayinlash (§2). Admin.
 * Foydalanuvchi avval botда ro'yxatdan o'tgan bo'lishi kerak (tg_id).
 */
export async function assignModerator(
  _prev: AssignState,
  formData: FormData,
): Promise<AssignState> {
  const { user: me } = await requireRole("admin");
  const phone = auth.normalizePhone(String(formData.get("phone") ?? ""));
  if (!phone) {
    return { ok: false, error: "Telefon raqamini to'g'ri kiriting.", note: null };
  }

  const db = getServiceClient();
  const { data } = await db
    .from("users")
    .select("id, role, password_hash, account_status")
    .eq("phone", phone)
    .maybeSingle();
  const user = data as
    | { id: string; role: string; password_hash: string | null; account_status: string }
    | null;

  if (!user) {
    return {
      ok: false,
      error: "Bunday foydalanuvchi yo'q. Avval botда ro'yxatdan o'tsin.",
      note: null,
    };
  }
  if (user.role === "admin") {
    return { ok: false, error: "Bu hisob allaqachon admin.", note: null };
  }
  if (user.role === "moderator") {
    return { ok: false, error: "Bu hisob allaqachon moderator.", note: null };
  }

  await db.from("users").update({ role: "moderator" }).eq("id", user.id);
  await logStatus({
    entity: "user",
    entityId: user.id,
    oldStatus: "talent",
    newStatus: "moderator",
    changedBy: me.id,
  });
  revalidatePath("/moderatorlar");

  const note = user.password_hash
    ? null
    : "Foydalanuvchi hali parol o'rnatmagan — botда «Login-parol olish» qilsin.";
  return { ok: true, error: null, note };
}
