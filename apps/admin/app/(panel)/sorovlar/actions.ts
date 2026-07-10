"use server";

import type { RequestStatus } from "@talantly/shared";
import { requestsRepo } from "@talantly/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { REQUEST_STATUS_ORDER } from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";

export async function setRequestStatus(formData: FormData): Promise<void> {
  const requestId = String(formData.get("requestId") ?? "");
  const newStatus = String(formData.get("status") ?? "") as RequestStatus;
  if (!REQUEST_STATUS_ORDER.includes(newStatus)) {
    throw new Error(`Noto'g'ri status: ${newStatus}`);
  }

  const session = await requireAdmin();
  const client = getServiceClient();
  const request = await requestsRepo.findById(client, requestId);
  if (!request) throw new Error(`So'rov ${requestId} topilmadi`);
  if (request.status === newStatus) return;

  await requestsRepo.setStatus(client, request, newStatus, session.user.id);
  revalidatePath("/sorovlar");
  revalidatePath("/dashboard");
}
