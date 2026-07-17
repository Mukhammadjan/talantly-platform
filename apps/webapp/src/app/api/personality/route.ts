import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { getDb } from "@/lib/server/db";
import { ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const ARCHETYPES = [
  "Yaratuvchi",
  "Tahlilchi",
  "Yetakchi",
  "Aloqachi",
  "Ijrochi",
  "Kashfiyotchi",
];

/** POST { answers: number[] } → talents.personality + archetype. */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const session = g.session;

  let body: { answers?: unknown };
  try {
    body = (await req.json()) as { answers?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const answers = Array.isArray(body.answers)
    ? body.answers.filter((a): a is number => Number.isInteger(a) && a >= 0 && a < 8)
    : [];
  if (answers.length === 0 || answers.length > 40) {
    return NextResponse.json({ error: "bad_answers" }, { status: 400 });
  }

  const sum = answers.reduce((s, a) => s + a, 0);
  const archetype = ARCHETYPES[sum % ARCHETYPES.length] ?? "Yaratuvchi";

  const talent = await ensureTalent(session);
  const { error } = await getDb()
    .from("talents")
    .update({ personality: { answers }, archetype })
    .eq("id", talent.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ archetype });
}
