import {
  ARCHETYPE_META,
  interviewsRepo,
  skillTestsRepo,
  type CompanyRow,
  type TalantlyClient,
  type TalentRow,
} from "@talantly/shared";
import type { CompanySnapshot, TalentCardPublic } from "../apiTypes";

export function toCompanySnapshot(company: CompanyRow): CompanySnapshot {
  return {
    id: company.id,
    name: company.name,
    kind: company.kind,
    city: company.city,
    activityType: company.activity_type,
    neededLevel: company.needed_level,
    urgency: company.urgency,
  };
}

/** "Dilnoza Rahimova" -> "Dilnoza R." — full names never reach the guest. */
export function guestDisplayName(fullName: string | null): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "Talant";
  const initial = parts[1]?.charAt(0);
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
}

export function toCard(
  talent: TalentRow,
  score: number | null,
  rating: number | null,
): TalentCardPublic {
  const code = talent.personality?.archetype_code ?? talent.personality?.archetype ?? null;
  return {
    id: talent.id,
    displayName: guestDisplayName(talent.full_name),
    photoUrl: talent.photo_url,
    direction: talent.direction,
    level: talent.level,
    city: talent.city,
    workFormats: talent.work_formats ?? [],
    skillTags: talent.skill_tags ?? [],
    headline: talent.headline,
    archetypeCode: code,
    archetypeLabel: code
      ? (talent.personality?.archetype_label ?? ARCHETYPE_META[code].label)
      : null,
    score,
    rating,
    verifiedAt: talent.verified_at,
    isDemo: talent.is_demo,
  };
}

export async function loadScoresAndRatings(
  client: TalantlyClient,
  talentIds: string[],
): Promise<{
  scores: Map<string, number>;
  ratings: Map<string, number>;
}> {
  const [tests, interviews] = await Promise.all([
    skillTestsRepo.listByTalentIds(client, talentIds),
    interviewsRepo.listApprovedByTalentIds(client, talentIds),
  ]);
  const scores = new Map<string, number>();
  for (const test of tests) {
    if (test.talent_id && test.score !== null && !scores.has(test.talent_id)) {
      scores.set(test.talent_id, test.score);
    }
  }
  const ratings = new Map<string, number>();
  for (const interview of interviews) {
    if (
      interview.talent_id &&
      interview.rating !== null &&
      !ratings.has(interview.talent_id)
    ) {
      ratings.set(interview.talent_id, interview.rating);
    }
  }
  return { scores, ratings };
}
