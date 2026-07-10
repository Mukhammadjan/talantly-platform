import {
  ARCHETYPE_META,
  interviewsRepo,
  skillTestsRepo,
  talentsRepo,
  type Archetype,
  type Direction,
  type TalentLevel,
  type TalentRow,
  type WorkFormat,
} from "@talantly/shared";
import { getSupabase } from "./supabase";

export interface PublicStats {
  verifiedTalents: number;
  companies: number;
}

/** Guest-safe card — NO phone, NO full name, NO full CV. */
export interface PublicTalentCard {
  id: string;
  displayName: string;
  photoUrl: string | null;
  direction: Direction | null;
  level: TalentLevel | null;
  city: string | null;
  workFormats: WorkFormat[];
  skillTags: string[];
  headline: string | null;
  archetypeCode: Archetype | null;
  archetypeLabel: string | null;
  score: number | null;
  rating: number | null;
}

/** "Dilnoza Rahimova" -> "Dilnoza R." — full names never reach the public site. */
function guestDisplayName(fullName: string | null): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "Talant";
  const initial = parts[1]?.charAt(0);
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
}

function toPublicCard(
  talent: TalentRow,
  score: number | null,
  rating: number | null,
): PublicTalentCard {
  const code =
    talent.personality?.archetype_code ?? talent.personality?.archetype ?? null;
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
  };
}

export async function getPublicStats(): Promise<PublicStats> {
  const client = getSupabase();
  const [talents, companies] = await Promise.all([
    client
      .from("talents")
      .select("id", { count: "exact", head: true })
      .eq("status", "tekshirilgan"),
    client.from("companies").select("id", { count: "exact", head: true }),
  ]);
  if (talents.error) throw talents.error;
  if (companies.error) throw companies.error;
  return {
    verifiedTalents: talents.count ?? 0,
    companies: companies.count ?? 0,
  };
}

export async function getVerifiedTalents(): Promise<PublicTalentCard[]> {
  const client = getSupabase();
  const verified = await talentsRepo.listVerified(client);
  const ids = verified.map((talent) => talent.id);
  const [tests, interviews] = await Promise.all([
    skillTestsRepo.listByTalentIds(client, ids),
    interviewsRepo.listApprovedByTalentIds(client, ids),
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
  return verified.map((talent) =>
    toPublicCard(
      talent,
      scores.get(talent.id) ?? null,
      ratings.get(talent.id) ?? null,
    ),
  );
}
