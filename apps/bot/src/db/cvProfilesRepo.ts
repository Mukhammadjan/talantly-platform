import { cvProfilesRepo } from "@talantly/shared";
import type { CvProfileInsert, CvProfileRow } from "@talantly/shared";
import { getSupabase } from "./client.js";

export async function findByTalentId(
  talentId: string,
): Promise<CvProfileRow | null> {
  return cvProfilesRepo.findByTalentId(getSupabase(), talentId);
}

export async function upsertByTalentId(
  values: CvProfileInsert & { talent_id: string },
): Promise<CvProfileRow> {
  return cvProfilesRepo.upsertByTalentId(getSupabase(), values);
}

export async function findPendingPdf(): Promise<CvProfileRow[]> {
  return cvProfilesRepo.findPendingPdf(getSupabase());
}

export async function setPdfPath(id: string, pdfPath: string): Promise<void> {
  return cvProfilesRepo.setPdfPath(getSupabase(), id, pdfPath);
}
