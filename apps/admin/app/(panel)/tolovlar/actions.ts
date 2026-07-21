"use server";

import { revalidatePath } from "next/cache";
import { requirePanel } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { logStatus } from "@/lib/log";

async function setStatus(
  id: string,
  status: "tasdiqlangan" | "rad",
): Promise<void> {
  const { user } = await requirePanel();
  const db = getServiceClient();

  const { data: before } = await db
    .from("payments")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await db
    .from("payments")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`payment ${status} failed: ${error.message}`);

  // status_log → push worker userga xabar beradi (notified=false).
  await logStatus({
    entity: "payment",
    entityId: id,
    oldStatus: (before as { status: string } | null)?.status ?? null,
    newStatus: status,
    changedBy: user.id,
  });

  revalidatePath("/tolovlar");
}

/** Tasdiqlash — moderator "bankda tekshirdim" ni belgilagan bo'lishi shart. */
export async function confirmPayment(formData: FormData): Promise<void> {
  if (formData.get("checked") !== "on") return; // himoya
  const id = String(formData.get("id") ?? "");
  if (id) await setStatus(id, "tasdiqlangan");
}

export async function rejectPayment(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await setStatus(id, "rad");
}
