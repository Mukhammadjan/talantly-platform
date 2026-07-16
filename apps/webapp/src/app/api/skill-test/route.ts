import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { ensureTalent, setTalentStatus } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const PASS_SCORE = 60;

/** POST { answers: number[] } — server o'zi baholaydi (correct_index clientda YO'Q). */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { answers?: unknown };
  try {
    body = (await req.json()) as { answers?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const answers = Array.isArray(body.answers)
    ? body.answers.map((a) => (Number.isInteger(a) ? (a as number) : -1))
    : [];
  if (answers.length === 0 || answers.length > 40) {
    return NextResponse.json({ error: "bad_answers" }, { status: 400 });
  }

  const talent = await ensureTalent(session);
  if (!talent.direction) {
    return NextResponse.json({ error: "direction_required" }, { status: 409 });
  }

  const db = getDb();
  const { data: questions, error: qErr } = await db
    .from("test_questions")
    .select("correct_index")
    .eq("is_active", true)
    .eq("direction", talent.direction)
    .order("ord", { ascending: true });
  if (qErr || !questions || questions.length === 0) {
    return NextResponse.json({ error: "no_questions" }, { status: 500 });
  }

  const correct = questions.reduce(
    (n, q, i) =>
      n + ((q as { correct_index: number }).correct_index === answers[i] ? 1 : 0),
    0,
  );
  const score = Math.round((correct / questions.length) * 100);

  const { error: insErr } = await db.from("skill_tests").insert({
    talent_id: talent.id,
    direction: talent.direction,
    score,
    answers: { answers },
    passed_at: score >= PASS_SCORE ? new Date().toISOString() : null,
  });
  if (insErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  if (score >= PASS_SCORE) {
    await setTalentStatus(talent, "test_otgan", `tg:${session.tgId}`);
  }

  return NextResponse.json({ score, passed: score >= PASS_SCORE });
}
