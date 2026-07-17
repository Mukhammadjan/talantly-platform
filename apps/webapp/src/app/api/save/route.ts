import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const KINDS = ["vacancy", "talant", "company"];

/** saved_items toggle — {saved: boolean} qaytaradi. */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const session = g.session;

  let body: { kind?: unknown; targetId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (
    typeof body.kind !== "string" ||
    !KINDS.includes(body.kind) ||
    typeof body.targetId !== "string"
  ) {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }

  const db = getDb();
  const { data: existing } = await db
    .from("saved_items")
    .select("id")
    .eq("user_id", session.userId)
    .eq("kind", body.kind)
    .eq("target_id", body.targetId)
    .maybeSingle();

  if (existing) {
    await db.from("saved_items").delete().eq("id", (existing as { id: string }).id);
    return NextResponse.json({ saved: false });
  }

  const { error } = await db.from("saved_items").insert({
    user_id: session.userId,
    kind: body.kind,
    target_id: body.targetId,
  });
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ saved: true });
}
