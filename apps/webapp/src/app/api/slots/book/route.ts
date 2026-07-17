import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";
import { applyEvent, ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const NO_SHOW_LIMIT = 2;
const NO_SHOW_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

/** POST { slotId } — race-safe band qilish → interviews → holat mashinasi. */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  let body: { slotId?: unknown };
  try {
    body = (await req.json()) as { slotId?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.slotId !== "string" || body.slotId.length < 10) {
    return NextResponse.json({ error: "bad_slot" }, { status: 400 });
  }

  const talent = await ensureTalent(g.session);
  const db = getDb();

  // 2 marta kelmagan bo'lsa — 7 kun cooldown (C10).
  const { data: noShows } = await db
    .from("interviews")
    .select("created_at")
    .eq("talent_id", talent.id)
    .eq("decision", "kelmadi")
    .order("created_at", { ascending: false });
  const ns = (noShows ?? []) as { created_at: string }[];
  if (ns.length >= NO_SHOW_LIMIT) {
    const latest = new Date(ns[0]?.created_at ?? 0).getTime();
    if (Date.now() - latest < NO_SHOW_COOLDOWN_MS) {
      return NextResponse.json(
        {
          error: "no_show_cooldown",
          retryAt: new Date(latest + NO_SHOW_COOLDOWN_MS).toISOString(),
        },
        { status: 429 },
      );
    }
  }

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

  // Holat mashinasi: faqat test_otgan'dan band qilish mumkin.
  const next = await applyEvent(talent, "suhbat_band_qilindi", `tg:${g.session.tgId}`);
  if (!next) {
    // O'tish mumkin emas — slotni qaytaramiz.
    await db.from("interview_slots").update({ is_taken: false }).eq("id", slot.id);
    return NextResponse.json(
      { error: "invalid_status", current: talent.status },
      { status: 409 },
    );
  }

  const { error: insErr } = await db.from("interviews").insert({
    talent_id: talent.id,
    slot_id: slot.id,
    scheduled_at: slot.starts_at,
  });
  if (insErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ scheduledAt: slot.starts_at });
}
