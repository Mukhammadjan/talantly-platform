import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const DIRECTIONS = [
  "dasturlash",
  "dizayn",
  "marketing",
  "sotuv",
  "data",
  "boshqa",
];

/** GET ?direction= — savollar (to'g'ri javob admin uchun ko'rinadi). */
export async function GET(req: Request): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const direction = url.searchParams.get("direction") ?? "dasturlash";
  if (!DIRECTIONS.includes(direction)) {
    return NextResponse.json({ error: "bad_direction" }, { status: 400 });
  }
  const { data } = await getDb()
    .from("test_questions")
    .select("id, direction, question, options, correct_index, is_active")
    .eq("direction", direction)
    .order("created_at", { ascending: true });
  return NextResponse.json({ items: data ?? [] });
}

/** POST — yangi savol yoki tahrir/faollik.
 *  { id?, direction, question, options[4], correctIndex, isActive } */
export async function POST(req: Request): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: {
    id?: string;
    direction?: string;
    question?: string;
    options?: unknown;
    correctIndex?: number;
    isActive?: boolean;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const db = getDb();

  // Faqat faollikni almashtirish
  if (body.id && body.question === undefined) {
    const { error } = await db
      .from("test_questions")
      .update({ is_active: Boolean(body.isActive) })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const direction = body.direction ?? "";
  const question = (body.question ?? "").trim();
  const options = Array.isArray(body.options)
    ? body.options.map((o) => String(o).trim()).filter(Boolean)
    : [];
  const correctIndex = Number(body.correctIndex);
  if (
    !DIRECTIONS.includes(direction) ||
    question.length < 5 ||
    options.length !== 4 ||
    !(correctIndex >= 0 && correctIndex < 4)
  ) {
    return NextResponse.json({ error: "bad_question" }, { status: 400 });
  }

  if (body.id) {
    const { error } = await db
      .from("test_questions")
      .update({
        question,
        options,
        correct_index: correctIndex,
        is_active: body.isActive ?? true,
      })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  } else {
    const { error } = await db.from("test_questions").insert({
      direction,
      question,
      options,
      correct_index: correctIndex,
      is_active: true,
    });
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
