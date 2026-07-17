import { NextResponse } from "next/server";
import { talentView } from "@talantly/shared";
import { ensureCompany } from "@/lib/server/company";
import { getDb } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDb();
  const { data } = await db
    .from("talents")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const row = data as talentView.TalentRow | null;
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: setting } = await db
    .from("settings")
    .select("value")
    .eq("key", "show_demo_data")
    .maybeSingle();
  const showDemo =
    ((setting as { value: string } | null)?.value ?? "true").toLowerCase() === "true";
  if (row.is_demo && !showDemo) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!row.is_demo && row.user_id !== session.userId) {
    try {
      const company = await ensureCompany(session);
      await db.from("profile_views").insert({
        talent_id: row.id,
        viewer_company_id: company.id,
      });
    } catch {
      /* statistika yiqilsa ham detal ochiladi */
    }
  }

  const { data: test } = await db
    .from("skill_tests")
    .select("score")
    .eq("talent_id", row.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    candidate: talentView.toCandidateView(
      row,
      (test as { score: number } | null)?.score ?? null,
    ),
  });
}
