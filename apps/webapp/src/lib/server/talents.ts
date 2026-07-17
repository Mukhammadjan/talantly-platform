import { statusMachine } from "@talantly/shared";
import type { SessionPayload } from "./auth";
import { getDb, logStatus } from "./db";
import { getSetting } from "./settings";

export interface TalentRowV2 {
  id: string;
  user_id: string;
  full_name: string | null;
  birth_year: number | null;
  city: string | null;
  district: string | null;
  direction: string | null;
  level: string | null;
  experience_years: number | null;
  skill_tags: string[];
  work_formats: string[];
  salary_from: number | null;
  headline: string | null;
  free_text: string | null;
  photo_url: string | null;
  portfolio_url: string | null;
  personality: unknown;
  archetype: string | null;
  status: string;
  is_demo: boolean;
}

/** Sessiya egasining talents qatori — bo'lmasa yaratiladi (status: yangi). */
export async function ensureTalent(
  session: SessionPayload,
): Promise<TalentRowV2> {
  const db = getDb();
  // Poyga-xavfsiz: ON CONFLICT DO NOTHING, keyin o'qish.
  const { error: upErr } = await db.from("talents").upsert(
    { user_id: session.userId, is_demo: false },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (upErr) throw new Error(`talents upsert failed: ${upErr.message}`);

  const { data, error } = await db
    .from("talents")
    .select("*")
    .eq("user_id", session.userId)
    .single();
  if (error) throw new Error(`talents read failed: ${error.message}`);
  return data as TalentRowV2;
}

/** Status o'zgarishi — har doim status_log bilan. FAQAT applyEvent chaqiradi. */
async function writeStatus(
  talent: Pick<TalentRowV2, "id" | "status">,
  newStatus: string,
  changedBy: string,
): Promise<void> {
  if (talent.status === newStatus) return;
  const db = getDb();
  const { error } = await db
    .from("talents")
    .update({ status: newStatus })
    .eq("id", talent.id);
  if (error) throw new Error(`talents status update failed: ${error.message}`);
  await logStatus({
    entity: "talents",
    entityId: talent.id,
    oldStatus: talent.status,
    newStatus,
    changedBy,
  });
}

/**
 * YAGONA status o'tish yo'li (A1): hodisa → statusMachine.nextStatus →
 * yozish. Noto'g'ri o'tish null qaytaradi (status o'zgarmaydi).
 */
export async function applyEvent(
  talent: Pick<TalentRowV2, "id" | "status">,
  event: statusMachine.TalantEvent,
  changedBy: string,
): Promise<string | null> {
  const cvPaymentRequired =
    ((await getSetting("cv_payment_required")) ?? "true").toLowerCase() === "true";
  const r = statusMachine.nextStatus(
    talent.status as statusMachine.TalantStatus,
    event,
    { cvPaymentRequired },
  );
  if (!r.ok) return null;
  await writeStatus(talent, r.next, changedBy);
  return r.next;
}

/** Frontend TalentSnapshot shakliga o'girish (api.ts imzosi saqlanadi). */
export async function buildSnapshot(
  talent: TalentRowV2,
): Promise<Record<string, unknown>> {
  const db = getDb();

  const [{ data: test }, { data: interview }, { data: cv }] = await Promise.all([
    db
      .from("skill_tests")
      .select("score")
      .eq("talent_id", talent.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from("interviews")
      .select("scheduled_at")
      .eq("talent_id", talent.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from("cv_profiles")
      .select("id")
      .eq("talent_id", talent.id)
      .limit(1)
      .maybeSingle(),
  ]);

  // Rad sababi (A4): suhbatdan — decision_reason; 3 yiqilgan test — test_past.
  let radReason: string | null = null;
  if (talent.status === "rad_etilgan") {
    const { data: lastInt } = await db
      .from("interviews")
      .select("decision_reason")
      .eq("talent_id", talent.id)
      .not("decision_reason", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    radReason =
      (lastInt as { decision_reason: string } | null)?.decision_reason ?? "test_past";
  }

  return {
    status: talent.status,
    isHidden: (talent as { is_hidden?: boolean }).is_hidden ?? false,
    radReason,
    score: (test as { score: number } | null)?.score ?? null,
    archetype: talent.archetype,
    interviewAt:
      (interview as { scheduled_at: string } | null)?.scheduled_at ?? null,
    cvReady: Boolean(cv),
    profile: {
      fullName: talent.full_name ?? "",
      birthYear: talent.birth_year,
      city: talent.city,
      district: talent.district,
      direction: talent.direction,
      level: talent.level,
      experienceYears: talent.experience_years,
      skills: talent.skill_tags ?? [],
      workFormats: talent.work_formats ?? [],
      salaryFrom: talent.salary_from,
      photoUrl: talent.photo_url,
      about: talent.free_text,
      portfolioUrl: talent.portfolio_url,
    },
  };
}
