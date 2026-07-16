import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
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
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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

  // Ko'rish statistikasi (o'z profili emas, demo emas bo'lsa).
  if (!talent.is_demo && talent.user_id !== session.userId) {
    try {
      const company = await ensureCompany(session);
      await db.from("profile_views").insert({
        talent_id: talent.id,
        viewer_company_id: company.id,
      });
    } catch {
      /* statistika yiqilsa ham detal ochiladi */
    }
  }

  const scores = await latestScores([talent.id]);
  return NextResponse.json({
    candidate: toCandidate(talent, scores.get(talent.id) ?? null),
  });
}
