import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getDb } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";
import { applyEvent, ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const PASS_SCORE = 60;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;

interface KeyPayload {
  t: string;
  q: { id: string; o: number[] }[];
}

/**
 * POST { key, answers: number[] } — server permutatsiya kaliti orqali
 * baholaydi (correct_index clientda YO'Q). Qoidalar: <60 → 24 soat cooldown,
 * maks 3 urinish, keyin rad_etilgan (test_past).
 */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  let body: { key?: unknown; answers?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.key !== "string" || !Array.isArray(body.answers)) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  const answers = body.answers.map((a) => (Number.isInteger(a) ? (a as number) : -1));

  const talent = await ensureTalent(g.session);
  const db = getDb();

  // Urinish qoidalari (B8)
  const { data: prevRows } = await db
    .from("skill_tests")
    .select("score, attempt_no, created_at")
    .eq("talent_id", talent.id)
    .order("created_at", { ascending: false });
  const prev = (prevRows ?? []) as {
    score: number;
    attempt_no: number;
    created_at: string;
  }[];
  const last = prev[0];
  const failedAttempts = prev.filter((p) => p.score < PASS_SCORE).length;

  if (last && last.score < PASS_SCORE) {
    const elapsed = Date.now() - new Date(last.created_at).getTime();
    if (elapsed < COOLDOWN_MS) {
      return NextResponse.json(
        {
          error: "cooldown",
          retryAt: new Date(
            new Date(last.created_at).getTime() + COOLDOWN_MS,
          ).toISOString(),
        },
        { status: 429 },
      );
    }
  }
  if (failedAttempts >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "attempts_exceeded" }, { status: 403 });
  }

  // Kalitni tekshirish — qaysi savollar qanday tartibda berilganini bilamiz.
  let payload: KeyPayload;
  try {
    const secret = new TextEncoder().encode(process.env.WEBAPP_JWT_SECRET ?? "");
    const { payload: p } = await jwtVerify(body.key, secret);
    payload = p as unknown as KeyPayload;
  } catch {
    return NextResponse.json({ error: "bad_key" }, { status: 401 });
  }
  if (payload.t !== talent.id || !Array.isArray(payload.q)) {
    return NextResponse.json({ error: "bad_key" }, { status: 401 });
  }

  const ids = payload.q.map((x) => x.id);
  const { data: qRows, error: qErr } = await db
    .from("test_questions")
    .select("id, correct_index")
    .in("id", ids);
  if (qErr || !qRows || qRows.length !== ids.length) {
    return NextResponse.json({ error: "no_questions" }, { status: 500 });
  }
  const correctById = new Map(
    (qRows as { id: string; correct_index: number }[]).map((r) => [
      r.id,
      r.correct_index,
    ]),
  );

  // Har javob: shuffle'dagi indeks → asl indeks → to'g'ri javob bilan solishtirish.
  let correct = 0;
  payload.q.forEach((q, i) => {
    const shown = answers[i];
    if (shown == null || shown < 0 || shown >= q.o.length) return;
    const original = q.o[shown];
    if (original === correctById.get(q.id)) correct++;
  });
  const score = Math.round((correct / payload.q.length) * 100);
  const passed = score >= PASS_SCORE;
  const attemptNo = (last?.attempt_no ?? 0) + 1;

  const { error: insErr } = await db.from("skill_tests").insert({
    talent_id: talent.id,
    direction: talent.direction,
    score,
    answers: { answers, questionIds: ids },
    attempt_no: attemptNo,
    passed_at: passed ? new Date().toISOString() : null,
  });
  if (insErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  // Holat mashinasi (A1): o'tdi → test_otgan; 3-yiqilish → rad_etilgan (test_past).
  if (passed) {
    await applyEvent(talent, "test_otdi", `tg:${g.session.tgId}`);
  } else if (failedAttempts + 1 >= MAX_ATTEMPTS) {
    await applyEvent(talent, "test_yiqildi_final", `tg:${g.session.tgId}`);
  }

  return NextResponse.json({
    score,
    passed,
    attemptNo,
    attemptsLeft: passed ? null : Math.max(0, MAX_ATTEMPTS - (failedAttempts + 1)),
  });
}
