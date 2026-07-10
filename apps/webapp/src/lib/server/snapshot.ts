import {
  cvProfilesRepo,
  interviewsRepo,
  skillTestsRepo,
  talentsRepo,
  usersRepo,
  type TalantlyClient,
  type TalentRow,
  type TalentStatus,
  type UserRow,
} from "@talantly/shared";
import { ARCHETYPE_META } from "@talantly/shared";
import type { PersonalitySummary, TalentSnapshot } from "../apiTypes";
import { serverEnv } from "./env";
import type { SessionPayload } from "./jwt";

const STATUSES_WITH_SCORE: TalentStatus[] = [
  "test_otgan",
  "suhbat_belgilangan",
  "tekshirilgan",
  "rad_etilgan",
];

const STATUSES_WITH_CV: TalentStatus[] = [
  "cv_tayyor",
  "test_otgan",
  "suhbat_belgilangan",
  "tekshirilgan",
];

export function readRegisterStep(talent: TalentRow): number {
  const data = talent.bot_state?.data;
  if (!data || typeof data !== "object") return 0;
  const raw = (data as Record<string, unknown>)["registerStep"];
  if (
    typeof raw === "number" &&
    Number.isInteger(raw) &&
    raw >= 0 &&
    raw <= 13
  ) {
    return raw;
  }
  return 0;
}

export function personalitySummary(
  talent: TalentRow,
): PersonalitySummary | null {
  const p = talent.personality;
  const code = p?.archetype_code ?? p?.archetype;
  if (!p || !code) return null;
  const meta = ARCHETYPE_META[code];
  return {
    archetypeCode: code,
    archetypeLabel: p.archetype_label ?? meta.label,
    tagline: p.tagline ?? meta.tagline,
    traits: p.traits ?? meta.traits,
    consistent: p.consistent ?? true,
  };
}

export async function buildSnapshot(
  client: TalantlyClient,
  user: UserRow,
  talent: TalentRow,
): Promise<TalentSnapshot> {
  let score: number | null = null;
  let interviewAt: string | null = null;
  let rejectedAt: string | null = null;
  let cvAvailable = false;

  if (STATUSES_WITH_SCORE.includes(talent.status)) {
    const test = await skillTestsRepo.findByTalentId(client, talent.id);
    score = test?.score ?? null;
  }
  if (
    talent.status === "suhbat_belgilangan" ||
    talent.status === "rad_etilgan"
  ) {
    const interview = await interviewsRepo.findLatestByTalentId(
      client,
      talent.id,
    );
    interviewAt = interview?.scheduled_at ?? null;
    rejectedAt =
      talent.status === "rad_etilgan" ? (interview?.decided_at ?? null) : null;
  }
  if (STATUSES_WITH_CV.includes(talent.status)) {
    const cv = await cvProfilesRepo.findByTalentId(client, talent.id);
    cvAvailable = Boolean(cv?.pdf_path);
  }

  return {
    preferredMode: user.preferred_mode,
    status: talent.status,
    fullName: talent.full_name,
    birthYear: talent.birth_year,
    city: talent.city,
    direction: talent.direction,
    education: talent.education,
    phone: user.phone,
    freeText: talent.free_text,
    portfolioUrl: talent.portfolio_url,
    registerStep: readRegisterStep(talent),
    verifiedAt: talent.verified_at,
    score,
    interviewAt,
    rejectedAt,
    cvAvailable,
    paymentEnabled: serverEnv.paymentEnabled,
    level: talent.level,
    experienceYears: talent.experience_years,
    workFormats: talent.work_formats ?? [],
    skillTags: talent.skill_tags ?? [],
    headline: talent.headline,
    personality: personalitySummary(talent),
  };
}

export interface SessionContext {
  user: UserRow;
  talent: TalentRow;
}

export async function loadSessionContext(
  client: TalantlyClient,
  session: SessionPayload,
): Promise<SessionContext | null> {
  const [user, talent] = await Promise.all([
    usersRepo.findById(client, session.userId),
    talentsRepo.findById(client, session.talentId),
  ]);
  if (!user || !talent) return null;
  return { user, talent };
}
