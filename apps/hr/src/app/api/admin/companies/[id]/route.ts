import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** POST { action: toggle_verified } */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (body.action !== "toggle_verified") {
    return NextResponse.json({ error: "bad_action" }, { status: 400 });
  }
  const db = getDb();
  const { data } = await db
    .from("companies")
    .select("is_verified")
    .eq("id", params.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const next = !(data as { is_verified: boolean }).is_verified;
  const { error } = await db
    .from("companies")
    .update({ is_verified: next })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true, isVerified: next });
}
