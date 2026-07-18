import { NextResponse } from "next/server";
import { adminSession } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** POST { action } — bloklash/yashirish tumblerlari. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await adminSession();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const db = getDb();
  const { data } = await db
    .from("talents")
    .select("id, user_id, is_hidden")
    .eq("id", params.id)
    .maybeSingle();
  const talent = data as {
    id: string;
    user_id: string | null;
    is_hidden: boolean;
  } | null;
  if (!talent) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (body.action === "toggle_hidden") {
    const { error } = await db
      .from("talents")
      .update({ is_hidden: !talent.is_hidden })
      .eq("id", talent.id);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true, isHidden: !talent.is_hidden });
  }

  if (body.action === "toggle_blocked") {
    if (!talent.user_id) {
      return NextResponse.json({ error: "no_user" }, { status: 409 });
    }
    const { data: u } = await db
      .from("users")
      .select("is_blocked")
      .eq("id", talent.user_id)
      .maybeSingle();
    const blocked = (u as { is_blocked: boolean } | null)?.is_blocked ?? false;
    const { error } = await db
      .from("users")
      .update({ is_blocked: !blocked })
      .eq("id", talent.user_id);
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true, isBlocked: !blocked });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
