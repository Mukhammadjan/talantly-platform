import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { ensureCompany } from "@/lib/server/companies";
import { getDb, logStatus } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const REQUEST_STATUSES = ["yangi", "korildi", "boglanildi", "yopildi"];

/** Ariza holatini o'zgartirish — faqat so'rov egasi kompaniya. */
export async function PATCH(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const session = g.session;

  let body: { id?: unknown; status?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.id !== "string") {
    return NextResponse.json({ error: "id_required" }, { status: 400 });
  }
  if (typeof body.status !== "string" || !REQUEST_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }

  const db = getDb();
  const company = await ensureCompany(session);

  const { data } = await db
    .from("requests")
    .select("id, company_id, status")
    .eq("id", body.id)
    .maybeSingle();
  const row = data as { id: string; company_id: string; status: string } | null;
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (row.company_id !== company.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (row.status === body.status) {
    return NextResponse.json({ id: row.id, status: row.status });
  }

  const { error } = await db
    .from("requests")
    .update({ status: body.status })
    .eq("id", row.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  await logStatus({
    entity: "requests",
    entityId: row.id,
    oldStatus: row.status,
    newStatus: body.status,
    changedBy: `tg:${session.tgId}`,
  });

  return NextResponse.json({ id: row.id, status: body.status });
}

/** Kompaniya so'rovi (kompaniya_sorovi). Demo profilga BLOK. */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const session = g.session;

  let body: { talentId?: unknown; note?: unknown; vacancyId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.talentId !== "string") {
    return NextResponse.json({ error: "talentId_required" }, { status: 400 });
  }

  const db = getDb();
  const { data: talent } = await db
    .from("talents")
    .select("id, is_demo")
    .eq("id", body.talentId)
    .maybeSingle();
  if (!talent) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if ((talent as { is_demo: boolean }).is_demo) {
    return NextResponse.json({ error: "demo_profile" }, { status: 403 });
  }

  const company = await ensureCompany(session);
  const { data: created, error } = await db
    .from("requests")
    .insert({
      kind: "kompaniya_sorovi",
      company_id: company.id,
      talent_id: body.talentId,
      vacancy_id: typeof body.vacancyId === "string" ? body.vacancyId : null,
      note: typeof body.note === "string" ? body.note.slice(0, 500) : null,
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
