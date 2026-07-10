"use server";

import { companiesRepo, talentsRepo } from "@talantly/shared";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { createShareToken } from "@/lib/shareToken";
import { getServiceClient } from "@/lib/supabase/service";

export interface ShareLinkState {
  url: string | null;
  error: string | null;
}

export async function createShareLink(
  _prev: ShareLinkState,
  formData: FormData,
): Promise<ShareLinkState> {
  const companyId = String(formData.get("companyId") ?? "");
  const talentIds = formData
    .getAll("talentIds")
    .map(String)
    .filter(Boolean);

  if (!companyId) {
    return { url: null, error: "Izlovchini tanlang." };
  }
  if (talentIds.length === 0) {
    return { url: null, error: "Kamida bitta talant tanlang." };
  }

  await requireAdmin();
  const client = getServiceClient();

  const company = await companiesRepo.findById(client, companyId);
  if (!company) {
    return { url: null, error: "Izlovchi topilmadi." };
  }

  // Only verified talents may appear on a share page
  const talents = await Promise.all(
    talentIds.map((id) => talentsRepo.findById(client, id)),
  );
  const verifiedIds = talents
    .filter((t) => t !== null && t.status === "tekshirilgan")
    .map((t) => (t as NonNullable<typeof t>).id);
  if (verifiedIds.length === 0) {
    return {
      url: null,
      error: "Tanlangan talantlar orasida tekshirilganlar yo'q.",
    };
  }

  const token = createShareToken(companyId, verifiedIds);
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return { url: `${proto}://${host}/ulashish/${token}`, error: null };
}
