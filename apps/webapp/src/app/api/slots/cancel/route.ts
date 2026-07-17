import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";
import { applyEvent, ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const MIN_HOURS_BEFORE = 3;

/** Talant suhbatni bekor qiladi (C11) — faqat ≥3 soat oldin, jarima yo'q. */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const talent = await ensureTalent(g.session);
  if (talent.status !== "suhbat_belgilangan") {
    return NextResponse.json({ error: "no_interview" }, { status: 409 });
  }

  const db = getDb();
  const { data: interview } = await db
    .from("interviews")
    .select("id, slot_id, scheduled_at, decision")
    .eq("talent_id", talent.id)
    .is("decision", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const row = interview as {
    id: string;
    slot_id: string | null;
    scheduled_at: string;
  } | null;
  if (!row) return NextResponse.json({ error: "no_interview" }, { status: 409 });

  const msLeft = new Date(row.scheduled_at).getTime() - Date.now();
  if (msLeft < MIN_HOURS_BEFORE * 60 * 60 * 1000) {
    return NextResponse.json({ error: "too_late" }, { status: 409 });
  }

  // Interview bekor + slot bo'shaydi + holat mashinasi orqali test_otgan.
  await db.from("interviews").update({ decision: "bekor" }).eq("id", row.id);
  if (row.slot_id) {
    await db.from("interview_slots").update({ is_taken: false }).eq("id", row.slot_id);
  }
  await applyEvent(talent, "suhbat_bekor", `tg:${g.session.tgId}`);
  await db.from("status_log").insert({
    entity: "interviews",
    entity_id: row.id,
    old_status: null,
    new_status: "bekor",
    changed_by: `tg:${g.session.tgId}`,
  });

  return NextResponse.json({ ok: true });
}
