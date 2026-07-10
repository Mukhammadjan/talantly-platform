import { cvProfilesRepo } from "@talantly/shared";
import type { CvProfileRow } from "@talantly/shared";
import { getSupabase } from "./client.js";

export async function findPendingPdf(): Promise<CvProfileRow[]> {
  return cvProfilesRepo.findPendingPdf(getSupabase());
}

export async function setPdfPath(id: string, pdfPath: string): Promise<void> {
  return cvProfilesRepo.setPdfPath(getSupabase(), id, pdfPath);
}
