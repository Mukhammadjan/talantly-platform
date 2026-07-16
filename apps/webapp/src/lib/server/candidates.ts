import { getDb } from "./db";
import type { TalentRowV2 } from "./talents";

/** "Kamola Odilova" → "Kamola O." — feed'da to'liq ism maxfiy. */
export function shortName(full: string | null): string {
  if (!full) return "Nomzod";
  const parts = full.trim().split(/\s+/);
  const first = parts[0] ?? "Nomzod";
  const last = parts[1];
  return last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
}

/** talent_id → eng so'nggi skill_tests.score xaritasi. */
export async function latestScores(
  talentIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (talentIds.length === 0) return map;
  const { data } = await getDb()
    .from("skill_tests")
    .select("talent_id, score, created_at")
    .in("talent_id", talentIds)
    .order("created_at", { ascending: false });
  for (const row of (data ?? []) as {
    talent_id: string;
    score: number;
  }[]) {
    if (!map.has(row.talent_id)) map.set(row.talent_id, row.score);
  }
  return map;
}

/** DB talents qatori → frontend Candidate shakli (api.ts imzosi saqlanadi). */
export function toCandidate(
  t: TalentRowV2 & { birth_year?: number | null },
  score: number | null,
  opts: { fullName?: boolean } = {},
): Record<string, unknown> {
  const year = new Date().getFullYear();
  return {
    id: t.id,
    displayName: opts.fullName ? (t.full_name ?? "Nomzod") : shortName(t.full_name),
    role: t.headline ?? "Mutaxassis",
    direction: t.direction ?? "boshqa",
    archetype: t.archetype ?? "—",
    score: score ?? 0,
    district: t.district ?? "",
    level: t.level ?? "intern",
    skills: t.skill_tags ?? [],
    about: t.free_text ?? "",
    salaryFrom: t.salary_from,
    verified: t.status === "tekshirilgan",
    photoUrl: t.photo_url,
    age: t.birth_year ? year - t.birth_year : undefined,
    experienceYears: t.experience_years ?? undefined,
    isDemo: t.is_demo,
  };
}
