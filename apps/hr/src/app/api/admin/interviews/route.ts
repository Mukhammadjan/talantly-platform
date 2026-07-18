import { NextResponse } from "next/server";
import { cvProfilesRepo, generateCv, type Direction } from "@talantly/shared";
import { adminAuthed } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";
import { applyEvent, logEntityStatus } from "@/lib/server/talentFlow";

export const dynamic = "force-dynamic";

interface InterviewRow {
  id: string;
  talent_id: string | null;
  slot_id: string | null;
  scheduled_at: string;
  decision: string | null;
  created_at: string;
}

/** GET — baholanmagan suhbatlar (talant ma'lumoti bilan). */
export async function GET(): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const db = getDb();
  const { data } = await db
    .from("interviews")
    .select("id, talent_id, slot_id, scheduled_at, decision, created_at")
    .is("decision", null)
    .order("scheduled_at", { ascending: true });
  const rows = (data ?? []) as InterviewRow[];

  const items = await Promise.all(
    rows.map(async (r) => {
      const { data: t } = r.talent_id
        ? await db
            .from("talents")
            .select("id, full_name, direction, city, status")
            .eq("id", r.talent_id)
            .maybeSingle()
        : { data: null };
      const talent = t as {
        id: string;
        full_name: string | null;
        direction: string | null;
        city: string | null;
        status: string;
      } | null;
      let score: number | null = null;
      if (talent) {
        const { data: s } = await db
          .from("skill_tests")
          .select("score")
          .eq("talent_id", talent.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        score = (s as { score: number } | null)?.score ?? null;
      }
      return {
        id: r.id,
        scheduledAt: r.scheduled_at,
        talentId: talent?.id ?? null,
        name: talent?.full_name ?? "?",
        direction: talent?.direction ?? "",
        city: talent?.city ?? "",
        status: talent?.status ?? "",
        score,
      };
    }),
  );
  return NextResponse.json({ items });
}

/** POST { id, action: approve|reject|noshow, rating?, reason?, notes? } —
 *  bot /baholash bilan bir xil zanjir. */
export async function POST(req: Request): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: {
    id?: string;
    action?: string;
    rating?: number;
    reason?: string;
    notes?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const { id, action } = body;
  if (!id || !["approve", "reject", "noshow"].includes(action ?? "")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (
    action === "reject" &&
    !["suhbat_yiqildi", "soxta_malumot"].includes(body.reason ?? "")
  ) {
    return NextResponse.json({ error: "bad_reason" }, { status: 400 });
  }

  const db = getDb();
  const { data } = await db
    .from("interviews")
    .select("id, talent_id, slot_id, decision")
    .eq("id", id)
    .maybeSingle();
  const iv = data as {
    id: string;
    talent_id: string | null;
    slot_id: string | null;
    decision: string | null;
  } | null;
  if (!iv || iv.decision !== null) {
    return NextResponse.json({ error: "already_done" }, { status: 409 });
  }
  const { data: t } = iv.talent_id
    ? await db.from("talents").select("*").eq("id", iv.talent_id).maybeSingle()
    : { data: null };
  const talent = t as {
    id: string;
    user_id: string | null;
    status: string;
    full_name: string | null;
    birth_year: number | null;
    city: string | null;
    direction: string | null;
    free_text: string | null;
    portfolio_url: string | null;
  } | null;
  if (!talent) {
    return NextResponse.json({ error: "talent_missing" }, { status: 404 });
  }
  const changedBy = "admin-web";
  const now = new Date().toISOString();

  if (action === "noshow") {
    await db
      .from("interviews")
      .update({ decision: "kelmadi", decided_at: now })
      .eq("id", id);
    if (iv.slot_id) {
      await db
        .from("interview_slots")
        .update({ is_taken: false })
        .eq("id", iv.slot_id);
    }
    await logEntityStatus({
      entity: "interviews",
      entityId: id,
      oldStatus: null,
      newStatus: "kelmadi",
      changedBy,
    });
    await applyEvent(talent, "suhbat_kelmadi", changedBy);
    return NextResponse.json({ ok: true });
  }

  const rating = Math.min(5, Math.max(1, Number(body.rating) || 3));
  const approved = action === "approve";
  await db
    .from("interviews")
    .update({
      decision: approved ? "approved" : "rejected",
      rating,
      notes: body.notes?.slice(0, 500) ?? null,
      decision_reason: approved ? null : body.reason,
      decided_at: now,
    })
    .eq("id", id);
  await logEntityStatus({
    entity: "interviews",
    entityId: id,
    oldStatus: null,
    newStatus: approved ? "approved" : "rejected",
    changedBy,
  });

  if (approved) {
    await applyEvent(talent, "tekshirildi", changedBy, { verified_at: now });
    // Verification-first: CV mukofot sifatida — mavjud bo'lmasa yaratiladi,
    // pdfWorker PDF qilib yuboradi.
    const existing = await cvProfilesRepo.findByTalentId(db, talent.id);
    if (!existing) {
      const cv = generateCv({
        fullName: talent.full_name ?? "",
        birthYear: talent.birth_year ?? 0,
        city: talent.city ?? "",
        direction: (talent.direction ?? "boshqa") as Direction,
        education: "",
        freeText: talent.free_text ?? "",
        portfolioUrl: talent.portfolio_url,
      });
      await cvProfilesRepo.upsertByTalentId(db, {
        talent_id: talent.id,
        summary: cv.summary,
        skills: cv.skills,
        experience: cv.experience,
        ai_verdict: cv.aiVerdict,
        pdf_path: null,
        generated_at: now,
      });
    }
  } else {
    await applyEvent(talent, "rad_etildi", changedBy);
    // Soxta ma'lumot — foydalanuvchi bloklanadi (F).
    if (body.reason === "soxta_malumot" && talent.user_id) {
      await db
        .from("users")
        .update({ is_blocked: true })
        .eq("id", talent.user_id);
    }
  }
  return NextResponse.json({ ok: true });
}
