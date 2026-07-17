import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getDb } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";
import { ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const SKILL_COUNT = 10;
const SECONDS_PER_QUESTION = 60;

interface QRow {
  id: string;
  question: string;
  options: string[];
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy.slice(0, n);
}

function shuffledOrder(len: number): number[] {
  const order = Array.from({ length: len }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j] as number, order[i] as number];
  }
  return order;
}

/**
 * GET /api/questions?kind=personality|skill
 * Skill: 30 tadan random 10, variantlar aralashtiriladi. Permutatsiya
 * imzolangan `key` (JWT) ichida — correct_index clientga HECH QACHON chiqmaydi.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const kind = new URL(req.url).searchParams.get("kind");
  const db = getDb();

  if (kind === "personality") {
    const { data, error } = await db
      .from("personality_questions")
      .select("id, question, options")
      .eq("is_active", true)
      .order("ord", { ascending: true });
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ questions: data ?? [] });
  }

  if (kind === "skill") {
    const talent = await ensureTalent(g.session);
    if (!talent.direction) {
      return NextResponse.json({ error: "direction_required" }, { status: 409 });
    }
    const { data, error } = await db
      .from("test_questions")
      .select("id, question, options")
      .eq("is_active", true)
      .eq("direction", talent.direction);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

    const bank = (data ?? []) as QRow[];
    if (bank.length === 0) {
      return NextResponse.json({ error: "no_questions" }, { status: 500 });
    }

    const picked = pickRandom(bank, Math.min(SKILL_COUNT, bank.length));
    const served = picked.map((q) => {
      const order = shuffledOrder(q.options.length);
      return {
        id: q.id,
        question: q.question,
        options: order.map((idx) => q.options[idx] as string),
        order,
      };
    });

    // Permutatsiya kaliti — 30 daqiqa amal qiladi, faqat shu talant uchun.
    const secret = new TextEncoder().encode(process.env.WEBAPP_JWT_SECRET ?? "");
    const key = await new SignJWT({
      t: talent.id,
      q: served.map((s) => ({ id: s.id, o: s.order })),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(secret);

    return NextResponse.json({
      questions: served.map(({ id, question, options }) => ({ id, question, options })),
      key,
      secondsPerQuestion: SECONDS_PER_QUESTION,
      direction: talent.direction,
    });
  }

  return NextResponse.json({ error: "bad_kind" }, { status: 400 });
}
