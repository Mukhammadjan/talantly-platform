"use server";

import { revalidatePath } from "next/cache";
import { requirePanel } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { logStatus } from "@/lib/log";

/** Shikoyatni hal qilingan deb belgilash (moderator + admin). */
export async function resolveComplaint(formData: FormData): Promise<void> {
  const { user } = await requirePanel();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const db = getServiceClient();
  const { data: before } = await db
    .from("complaints")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await db
    .from("complaints")
    .update({ status: "hal_qilindi" })
    .eq("id", id);
  if (error) throw new Error(`resolveComplaint failed: ${error.message}`);

  await logStatus({
    entity: "complaint",
    entityId: id,
    oldStatus: (before as { status: string } | null)?.status ?? null,
    newStatus: "hal_qilindi",
    changedBy: user.id,
  });

  revalidatePath("/shikoyatlar");
}
