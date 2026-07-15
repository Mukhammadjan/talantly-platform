import { DIRECTION_LABELS_UZ, LEVEL_LABELS_UZ } from "@talantly/shared";
import type { TalentCardPublic, TalentDetailPublic } from "@/lib/apiTypes";
import type { Candidate } from "./data";

// Maps real guest-safe API payloads onto the recruiter UI's Candidate shape,
// so the /ish design renders live data instead of the static fixtures.

const TONES = ["orange", "blue", "green", "purple"];

function toneFor(id: string): string {
  let sum = 0;
  for (const ch of id) sum += ch.charCodeAt(0);
  return TONES[sum % TONES.length] ?? "orange";
}

export function cardToCandidate(t: TalentCardPublic): Candidate {
  return {
    id: t.id,
    name: t.displayName,
    archetype: t.archetypeLabel ?? "",
    role: t.direction ? DIRECTION_LABELS_UZ[t.direction] : "Mutaxassis",
    skills: t.skillTags,
    score: t.score ?? 0,
    district: t.city ?? "",
    verified: Boolean(t.verifiedAt),
    experience: t.level ? LEVEL_LABELS_UZ[t.level] : "",
    about: t.headline ?? "",
    rate: "Kelishuv asosida",
    tone: toneFor(t.id),
    // Real feed is not paywalled here — the request flow is the gate, not premium.
    premium: false,
  };
}

export function detailToCandidate(t: TalentDetailPublic): Candidate {
  const base = cardToCandidate(t);
  return {
    ...base,
    about: t.summary ?? t.headline ?? "",
    experience:
      t.experienceYears != null ? `${t.experienceYears} yil` : base.experience,
    skills: t.cvSkills.length > 0 ? t.cvSkills : t.skillTags,
  };
}
