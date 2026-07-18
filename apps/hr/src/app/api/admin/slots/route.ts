import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** GET — kelgusi slotlar. */
export async function GET(): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { data } = await getDb()
    .from("interview_slots")
    .select("id, starts_at, is_taken")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(60);
  return NextResponse.json({ items: data ?? [] });
}

/** POST { datetimes: string[] } — yangi slotlar (ISO). */
export async function POST(req: Request): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { datetimes?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const list = Array.isArray(body.datetimes)
    ? body.datetimes
        .filter((d): d is string => typeof d === "string")
        .map((d) => new Date(d))
        .filter((d) => !Number.isNaN(d.getTime()) && d.getTime() > Date.now())
        .slice(0, 50)
    : [];
  if (list.length === 0) {
    return NextResponse.json({ error: "bad_datetimes" }, { status: 400 });
  }
  const { error } = await getDb()
    .from("interview_slots")
    .insert(list.map((d) => ({ starts_at: d.toISOString(), is_taken: false })));
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true, added: list.length });
}

/** DELETE { id } — faqat bo'sh slot o'chadi. */
export async function DELETE(req: Request): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { id?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const db = getDb();
  const { data } = await db
    .from("interview_slots")
    .select("is_taken")
    .eq("id", body.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if ((data as { is_taken: boolean }).is_taken) {
    return NextResponse.json({ error: "taken" }, { status: 409 });
  }
  await db.from("interview_slots").delete().eq("id", body.id);
  return NextResponse.json({ ok: true });
}
