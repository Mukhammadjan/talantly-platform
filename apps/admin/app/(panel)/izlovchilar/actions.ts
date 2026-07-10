"use server";

import type { CompanyStatus } from "@talantly/shared";
import { companiesRepo } from "@talantly/shared";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { COMPANY_STATUS_ORDER } from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";

export async function setCompanyStatus(formData: FormData): Promise<void> {
  const companyId = String(formData.get("companyId") ?? "");
  const newStatus = String(formData.get("status") ?? "") as CompanyStatus;
  if (!COMPANY_STATUS_ORDER.includes(newStatus)) {
    throw new Error(`Noto'g'ri status: ${newStatus}`);
  }

  const session = await requireAdmin();
  const client = getServiceClient();
  const company = await companiesRepo.findById(client, companyId);
  if (!company) throw new Error(`Izlovchi ${companyId} topilmadi`);
  if (company.status === newStatus) return;

  await companiesRepo.setStatus(client, company, newStatus, session.user.id);
  revalidatePath("/izlovchilar");
  revalidatePath("/dashboard");
}

export async function saveCompanyNotes(formData: FormData): Promise<void> {
  const companyId = String(formData.get("companyId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  await requireAdmin();
  const client = getServiceClient();
  await companiesRepo.updateFields(client, companyId, {
    notes: notes || null,
  });
  revalidatePath("/izlovchilar");
}
