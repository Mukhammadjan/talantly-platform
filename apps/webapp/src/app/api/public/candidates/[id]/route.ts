import { NextResponse } from "next/server";
import { type TalentRow, toCandidateView } from "@talantly/shared/talent-view";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

// Ochiq nomzod detali — qisqa ism, kontakt maxfiy (unlock login+to'lov talab qiladi).

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const db = getDb();
  const demoOn = await showDemo();

  const { data } = await db
    .from("talents")
    .select("*")
    .eq("id", params.id)
    .eq("status", "tekshirilgan")
    .maybeSingle();
  const t = data as (TalentRow & { is_hidden?: boolean }) | null;
  if (!t || t.is_hidden || (t.is_demo && !demoOn)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: st } = await db
    .from("skill_tests")
    .select("score")
    .eq("talent_id", t.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const score = (st as { score: number } | null)?.score ?? null;

  return NextResponse.json({ candidate: toCandidateView(t, score) });
}
