import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { ensureTalent, setTalentStatus } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

/** POST { slotId } — race-safe band qilish → interviews → status. */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { slotId?: unknown };
  try {
    body = (await req.json()) as { slotId?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.slotId !== "string" || body.slotId.length < 10) {
    return NextResponse.json({ error: "bad_slot" }, { status: 400 });
  }

  const talent = await ensureTalent(session);
  if (talent.status === "suhbat_belgilangan" || talent.status === "tekshirilgan") {
    return NextResponse.json({ error: "already_booked" }, { status: 409 });
  }

  const db = getDb();
  // Shartli claim: faqat bo'sh bo'lsa band bo'ladi (poyga xavfsiz).
  const { data: claimed, error: claimErr } = await db
    .from("interview_slots")
    .update({ is_taken: true })
    .eq("id", body.slotId)
    .eq("is_taken", false)
    .select()
    .maybeSingle();
  if (claimErr) return NextResponse.json({ error: "db_error" }, { status: 500 });
  if (!claimed) {
    return NextResponse.json({ error: "slot_taken" }, { status: 409 });
  }

  const slot = claimed as { id: string; starts_at: string };
  const { error: insErr } = await db.from("interviews").insert({
    talent_id: talent.id,
    slot_id: slot.id,
    scheduled_at: slot.starts_at,
  });
  if (insErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  await setTalentStatus(talent, "suhbat_belgilangan", `tg:${session.tgId}`);

  return NextResponse.json({ scheduledAt: slot.starts_at });
}
