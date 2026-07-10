import type { TalantlyClient } from "../db/client.js";
import type { SkillTestInsert, SkillTestRow } from "../types.js";

export async function findByTalentId(
  client: TalantlyClient,
  talentId: string,
): Promise<SkillTestRow | null> {
  const { data, error } = await client
    .from("skill_tests")
    .select("*")
    .eq("talent_id", talentId)
    .order("passed_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(
      `skillTestsRepo.findByTalentId(${talentId}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  const rows = (data ?? []) as SkillTestRow[];
  return rows[0] ?? null;
}

export async function insert(
  client: TalantlyClient,
  values: SkillTestInsert,
): Promise<SkillTestRow> {
  const { data, error } = await client
    .from("skill_tests")
    .insert(values)
    .select()
    .single();

  if (error) {
    throw new Error(
      `skillTestsRepo.insert(talent=${values.talent_id ?? "null"}) failed: ${error.message} (code=${error.code ?? "unknown"})`,
    );
  }
  return data as SkillTestRow;
}
