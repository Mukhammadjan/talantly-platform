import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

/**
 * GET /api/questions?kind=personality|skill
 * Savollar clientga correct_index'SIZ boradi — baholash faqat serverda.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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
    const talent = await ensureTalent(session);
    if (!talent.direction) {
      return NextResponse.json({ error: "direction_required" }, { status: 409 });
    }
    const { data, error } = await db
      .from("test_questions")
      .select("id, question, options")
      .eq("is_active", true)
      .eq("direction", talent.direction)
      .order("ord", { ascending: true });
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ questions: data ?? [], direction: talent.direction });
  }

  return NextResponse.json({ error: "bad_kind" }, { status: 400 });
}
