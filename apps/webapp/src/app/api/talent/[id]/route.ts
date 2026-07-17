import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { latestScores, toCandidate } from "@/lib/server/candidates";
import { ensureCompany } from "@/lib/server/companies";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";
import type { TalentRowV2 } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

/** Nomzod detali + profile_views yoziladi. Demo yashirin bo'lsa 404. */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const session = g.session;

  const db = getDb();
  const { data, error } = await db
    .from("talents")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  const talent = data as TalentRowV2 | null;
  if (!talent) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (talent.is_demo && !(await showDemo())) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Ko'rish statistikasi + kontakt ochiqligi (D15/E18).
  let contactUnlocked = false;
  let contact: { username: string | null; fullName: string | null; portfolioUrl: string | null } | null =
    null;
  if (!talent.is_demo && talent.user_id !== session.userId) {
    try {
      const company = await ensureCompany(session);
      await db.from("profile_views").insert({
        talent_id: talent.id,
        viewer_company_id: company.id,
      });

      // 1) Tasdiqlangan unlock yozuvi (doimiy — obuna tugasa ham ochiq qoladi)
      const { data: unlock } = await db
        .from("contact_unlocks")
        .select("id")
        .eq("company_id", company.id)
        .eq("talent_id", talent.id)
        .eq("status", "tasdiqlangan")
        .limit(1)
        .maybeSingle();
      // 2) Talant shu kompaniyaga o'zi ariza bergan (roziligi) — unlock shart emas
      const { data: applied } = await db
        .from("requests")
        .select("id")
        .eq("kind", "talant_qiziqishi")
        .eq("talent_id", talent.id)
        .eq("company_id", company.id)
        .limit(1)
        .maybeSingle();
      contactUnlocked = Boolean(unlock) || Boolean(applied);

      if (contactUnlocked && talent.user_id) {
        const { data: u } = await db
          .from("users")
          .select("username")
          .eq("id", talent.user_id)
          .maybeSingle();
        contact = {
          username: (u as { username: string | null } | null)?.username ?? null,
          fullName: talent.full_name,
          portfolioUrl: (talent as { portfolio_url?: string | null }).portfolio_url ?? null,
        };
      }
    } catch {
      /* statistika yiqilsa ham detal ochiladi */
    }
  }

  const scores = await latestScores([talent.id]);
  return NextResponse.json({
    candidate: toCandidate(talent, scores.get(talent.id) ?? null),
    contactUnlocked,
    contact,
  });
}
