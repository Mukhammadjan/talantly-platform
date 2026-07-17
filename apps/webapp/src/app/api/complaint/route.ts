import { NextResponse } from "next/server";
import { getDb, logStatus } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

/** Shikoyat (F23) — admin navbatiga tushadi, bot push orqali xabar beradi. */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  let body: { subject?: unknown; note?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.subject !== "string" || body.subject.trim().length < 3) {
    return NextResponse.json({ error: "subject_required" }, { status: 400 });
  }

  const { data: created, error } = await getDb()
    .from("complaints")
    .insert({
      user_id: g.session.userId,
      subject: body.subject.trim().slice(0, 140),
      note: typeof body.note === "string" ? body.note.slice(0, 1000) : null,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  // Push worker adminга yetkazadi (status_log → bot).
  await logStatus({
    entity: "complaints",
    entityId: (created as { id: string }).id,
    oldStatus: null,
    newStatus: "yangi",
    changedBy: `tg:${g.session.tgId}`,
  });

  return NextResponse.json({ ok: true });
}
