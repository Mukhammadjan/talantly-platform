import type { SupabaseClient } from "@supabase/supabase-js";

// Feed nomzod ko'rinishi — webapp (Bearer) va HR (cookie) BIR XIL ishlatadi.
// DB qatorini clientga xavfsiz shaklga o'giradi (to'liq ism maxfiy).

export interface TalentRow {
  id: string;
  user_id: string | null;
  full_name: string | null;
  birth_year: number | null;
  district: string | null;
  direction: string | null;
  level: string | null;
  experience_years: number | null;
  skill_tags: string[] | null;
  work_formats: string[] | null;
  salary_from: number | null;
  headline: string | null;
  free_text: string | null;
  photo_url: string | null;
  archetype: string | null;
  status: string;
  is_demo: boolean;
}

export interface CandidateView {
  id: string;
  displayName: string;
  role: string;
  direction: string;
  archetype: string;
  score: number;
  district: string;
  level: string;
  skills: string[];
  about: string;
  salaryFrom: number | null;
  verified: boolean;
  photoUrl: string | null;
  age?: number;
  experienceYears?: number;
  isDemo: boolean;
}

export interface FeedFilters {
  direction?: string | null;
  level?: string | null;
  district?: string | null;
  minSalary?: number | null;
  workFormat?: string | null;
  search?: string | null;
  sort?: "score" | "recent" | "salary";
  limit?: number;
  offset?: number;
}

/** "Kamola Odilova" → "Kamola O." */
export function shortName(full: string | null): string {
  if (!full) return "Nomzod";
  const parts = full.trim().split(/\s+/);
  const first = parts[0] ?? "Nomzod";
  const last = parts[1];
  return last ? `${first} ${last.charAt(0).toUpperCase()}.` : first;
}

export function toCandidateView(
  t: TalentRow,
  score: number | null,
  opts: { fullName?: boolean } = {},
): CandidateView {
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
    ...(t.birth_year ? { age: year - t.birth_year } : {}),
    ...(t.experience_years != null ? { experienceYears: t.experience_years } : {}),
    isDemo: t.is_demo,
  };
}

async function latestScores(
  db: SupabaseClient,
  ids: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (ids.length === 0) return map;
  const { data } = await db
    .from("skill_tests")
    .select("talent_id, score, created_at")
    .in("talent_id", ids)
    .order("created_at", { ascending: false });
  for (const r of (data ?? []) as { talent_id: string; score: number }[]) {
    if (!map.has(r.talent_id)) map.set(r.talent_id, r.score);
  }
  return map;
}

/** Tekshirilgan nomzodlar feed'i (filtr + demo toggle). Bitta manba. */
export async function queryVerifiedTalents(
  db: SupabaseClient,
  showDemo: boolean,
  filters: FeedFilters = {},
): Promise<{ candidates: CandidateView[]; total: number }> {
  let q = db
    .from("talents")
    .select("*", { count: "exact" })
    .eq("status", "tekshirilgan");
  if (!showDemo) q = q.eq("is_demo", false);
  if (filters.direction) q = q.eq("direction", filters.direction);
  if (filters.level) q = q.eq("level", filters.level);
  if (filters.district) q = q.eq("district", filters.district);
  if (filters.minSalary) q = q.gte("salary_from", filters.minSalary);
  if (filters.workFormat) q = q.contains("work_formats", [filters.workFormat]);
  if (filters.search) {
    const s = filters.search.replace(/[%,]/g, "");
    q = q.or(`full_name.ilike.%${s}%,headline.ilike.%${s}%`);
  }
  if (filters.sort === "salary") q = q.order("salary_from", { ascending: false, nullsFirst: false });
  else q = q.order("created_at", { ascending: false });

  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw new Error(`queryVerifiedTalents failed: ${error.message}`);

  const rows = (data ?? []) as TalentRow[];
  const scores = await latestScores(db, rows.map((r) => r.id));
  let candidates = rows.map((r) => toCandidateView(r, scores.get(r.id) ?? null));
  // Ball bo'yicha saralash (score alohida jadvaldan — JS'da).
  if (filters.sort === "score") {
    candidates = [...candidates].sort((a, b) => b.score - a.score);
  }
  return { candidates, total: count ?? candidates.length };
}
