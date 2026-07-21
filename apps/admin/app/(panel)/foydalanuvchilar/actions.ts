"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { logStatus } from "@/lib/log";

export interface ActionState {
  ok: boolean;
  error: string | null;
}

const OK: ActionState = { ok: true, error: null };

function revalidateUsers(): void {
  revalidatePath("/foydalanuvchilar");
  revalidatePath("/moderatorlar");
}

/** Muzlatish — login/feed'dan chiqadi. Admin. O'zini muzlata olmaydi. */
export async function freezeUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user: me } = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!id) return { ok: false, error: "id yo'q" };
  if (id === me.id) return { ok: false, error: "O'zingizni muzlata olmaysiz" };

  const db = getServiceClient();
  const { error } = await db
    .from("users")
    .update({
      account_status: "frozen",
      frozen_at: new Date().toISOString(),
      frozen_by: me.id,
      freeze_reason: reason,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await logStatus({
    entity: "user",
    entityId: id,
    oldStatus: "active",
    newStatus: "frozen",
    changedBy: me.id,
  });
  revalidateUsers();
  return OK;
}

/** Tiklash — qaytadan faol. Admin. */
export async function restoreUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user: me } = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "id yo'q" };

  const db = getServiceClient();
  const { error } = await db
    .from("users")
    .update({
      account_status: "active",
      frozen_at: null,
      frozen_by: null,
      freeze_reason: null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await logStatus({
    entity: "user",
    entityId: id,
    oldStatus: "frozen",
    newStatus: "active",
    changedBy: me.id,
  });
  revalidateUsers();
  return OK;
}

/**
 * Butunlay o'chirish — QAYTMAS. Faqat muzlatilgan hisob. Ism tasdiqlanadi.
 * Moliyaviy yozuvlar anonim saqlanadi (admin_hard_delete_user funksiyasi).
 */
export async function hardDeleteUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user: me } = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const confirmName = String(formData.get("confirmName") ?? "").trim();
  if (!id) return { ok: false, error: "id yo'q" };
  if (id === me.id) return { ok: false, error: "O'zingizni o'chira olmaysiz" };

  const db = getServiceClient();
  const { data: u } = await db
    .from("users")
    .select("account_status, phone, role")
    .eq("id", id)
    .maybeSingle();
  const row = u as { account_status: string; phone: string | null; role: string } | null;
  if (!row) return { ok: false, error: "Topilmadi" };
  if (row.account_status !== "frozen") {
    return { ok: false, error: "Faqat muzlatilgan hisobni o'chirish mumkin" };
  }

  const { data: t } = await db
    .from("talents")
    .select("full_name")
    .eq("user_id", id)
    .maybeSingle();
  const expected = (
    (t as { full_name: string | null } | null)?.full_name ??
    row.phone ??
    ""
  )
    .trim()
    .toLowerCase();
  if (!expected || confirmName.toLowerCase() !== expected) {
    return { ok: false, error: "Ism/telefon mos kelmadi" };
  }

  // Audit — o'chirishdan OLDIN yoziladi (user qatori keyin yo'qoladi).
  await logStatus({
    entity: "user",
    entityId: id,
    oldStatus: "frozen",
    newStatus: "hard_deleted",
    changedBy: me.id,
  });

  const { error } = await db.rpc("admin_hard_delete_user", { p_user_id: id });
  if (error) return { ok: false, error: error.message };

  revalidateUsers();
  return OK;
}
