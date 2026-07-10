import { skillTestsRepo } from "@talantly/shared";
import type { SkillTestRow } from "@talantly/shared";
import { getSupabase } from "./client.js";

export async function findByTalentId(
  talentId: string,
): Promise<SkillTestRow | null> {
  return skillTestsRepo.findByTalentId(getSupabase(), talentId);
}
