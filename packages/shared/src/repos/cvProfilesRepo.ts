import type { TalantlyClient } from "../db/client.js";
import type { CvProfileInsert, CvProfileRow } from "../types.js";

export async function findByTalentId(
  client: TalantlyClient,
  talentId: string,
): Promise<CvProfileRow | null> {
  const { data, error } = await client
    .from("cv_profiles")
    .select("*")
    .eq("talent_id", talentId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `cvProfilesRepo.findByTalentId(${talentId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as CvProfileRow | null) ?? null;
}

export async function upsertByTalentId(
  client: TalantlyClient,
  values: CvProfileInsert & { talent_id: string },
): Promise<CvProfileRow> {
  const { data, error } = await client
    .from("cv_profiles")
    .upsert(values, { onConflict: "talent_id" })
    .select()
    .single();

  if (error) {
    throw new Error(
      `cvProfilesRepo.upsertByTalentId(${values.talent_id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as CvProfileRow;
}

export async function findPendingPdf(
  client: TalantlyClient,
): Promise<CvProfileRow[]> {
  const { data, error } = await client
    .from("cv_profiles")
    .select("*")
    .is("pdf_path", null)
    .order("generated_at", { ascending: true });

  if (error) {
    throw new Error(
      `cvProfilesRepo.findPendingPdf failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return (data as CvProfileRow[]) ?? [];
}

export async function setPdfPath(
  client: TalantlyClient,
  id: string,
  pdfPath: string,
): Promise<void> {
  const { error } = await client
    .from("cv_profiles")
    .update({ pdf_path: pdfPath })
    .eq("id", id);

  if (error) {
    throw new Error(
      `cvProfilesRepo.setPdfPath(${id}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
}
