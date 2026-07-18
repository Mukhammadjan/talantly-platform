import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";
import { logEntityStatus } from "@/lib/server/talentFlow";

export const dynamic = "force-dynamic";

/** POST { status: faol|yopilgan } — vakansiya moderatsiyasi. */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (!["faol", "yopilgan"].includes(body.status ?? "")) {
    return NextResponse.json({ error: "bad_status" }, { status: 400 });
  }
  const db = getDb();
  const { data } = await db
    .from("vacancies")
    .select("status")
    .eq("id", params.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const old = (data as { status: string }).status;
  const { error } = await db
    .from("vacancies")
    .update({ status: body.status })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  await logEntityStatus({
    entity: "vacancies",
    entityId: params.id,
    oldStatus: old,
    newStatus: body.status ?? "",
    changedBy: "admin-web",
  });
  return NextResponse.json({ ok: true });
}
