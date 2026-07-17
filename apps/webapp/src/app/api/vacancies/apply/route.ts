import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { getDb, logStatus } from "@/lib/server/db";
import { ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

/** Talant vakansiyaga ariza beradi (talant_qiziqishi). */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const session = g.session;

  let body: { vacancyId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.vacancyId !== "string") {
    return NextResponse.json({ error: "vacancyId_required" }, { status: 400 });
  }

  const db = getDb();
  const { data: vacancy } = await db
    .from("vacancies")
    .select("id, company_id, is_demo, status")
    .eq("id", body.vacancyId)
    .maybeSingle();
  if (!vacancy) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const v = vacancy as {
    id: string;
    company_id: string;
    is_demo: boolean;
    status: string;
  };
  if (v.is_demo) {
    return NextResponse.json({ error: "demo_vacancy" }, { status: 403 });
  }
  if (v.status !== "faol") {
    return NextResponse.json({ error: "not_active" }, { status: 409 });
  }

  const talent = await ensureTalent(session);

  // Dublikat ariza — bitta vakansiyaga bir marta.
  const { data: dup } = await db
    .from("requests")
    .select("id")
    .eq("kind", "talant_qiziqishi")
    .eq("talent_id", talent.id)
    .eq("vacancy_id", v.id)
    .maybeSingle();
  if (dup) return NextResponse.json({ error: "already_applied" }, { status: 409 });

  const { data: created, error } = await db
    .from("requests")
    .insert({
      kind: "talant_qiziqishi",
      talent_id: talent.id,
      company_id: v.company_id,
      vacancy_id: v.id,
    })
    .select("id, status")
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const row = created as { id: string; status: string };
  await logStatus({
    entity: "requests",
    entityId: row.id,
    oldStatus: null,
    newStatus: row.status,
    changedBy: `tg:${session.tgId}`,
  });

  return NextResponse.json({ id: row.id, status: row.status });
}
