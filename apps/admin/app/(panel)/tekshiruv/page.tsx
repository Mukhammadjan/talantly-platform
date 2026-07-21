import { requirePanel } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { DIRECTION_LABELS, STATUS_LABELS } from "@/lib/labels";
import { Queue, type Candidate } from "./Queue";

export const dynamic = "force-dynamic";

// Tekshiruv navbatidagi statuslar — to'lovdan keyin, hali yakunlanmagan.
const IN_REVIEW = ["cv_tayyor", "test_otgan", "suhbat_belgilangan"] as const;

interface Raw {
  id: string;
  full_name: string | null;
  direction: string | null;
  level: string | null;
  city: string | null;
  headline: string | null;
  free_text: string | null;
  portfolio_url: string | null;
  status: string;
  created_at: string;
  skill_tests: { score: number | null; passed_at: string | null }[] | null;
  cv_profiles:
    | { summary: string | null; ai_verdict: string | null }
    | { summary: string | null; ai_verdict: string | null }[]
    | null;
  interviews: { rating: number | null; notes: string | null }[] | null;
}

export default async function TekshiruvPage() {
  await requirePanel();
  const db = getServiceClient();

  const { data } = await db
    .from("talents")
    .select(
      "id, full_name, direction, level, city, headline, free_text, portfolio_url, status, created_at, " +
        "skill_tests(score, passed_at), cv_profiles(summary, ai_verdict), interviews(rating, notes)",
    )
    .in("status", IN_REVIEW as unknown as string[])
    .order("created_at", { ascending: true })
    .limit(500);

  const rows = (data ?? []) as unknown as Raw[];
  const candidates: Candidate[] = rows.map((r) => {
    const st = (r.skill_tests ?? []).filter((s) => s.score != null);
    const score = st.length ? Math.max(...st.map((s) => s.score ?? 0)) : null;
    const cv = Array.isArray(r.cv_profiles)
      ? (r.cv_profiles[0] ?? null)
      : (r.cv_profiles ?? null);
    const iv = (r.interviews ?? []).find((i) => i.rating != null) ?? null;
    return {
      id: r.id,
      name: r.full_name ?? "Ismsiz",
      direction: r.direction,
      directionLabel: r.direction
        ? (DIRECTION_LABELS[r.direction as keyof typeof DIRECTION_LABELS] ??
          r.direction)
        : "—",
      levelLabel:
        r.level === "intern"
          ? "Intern"
          : r.level === "mutaxassis"
            ? "Mutaxassis"
            : null,
      city: r.city,
      headline: r.headline,
      freeText: r.free_text,
      portfolio: r.portfolio_url,
      status: r.status,
      statusLabel:
        STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] ?? r.status,
      createdAt: r.created_at,
      score,
      cvSummary: cv?.summary ?? null,
      aiVerdict: cv?.ai_verdict ?? null,
      interviewRating: iv?.rating ?? null,
    };
  });

  return <Queue initial={candidates} />;
}
