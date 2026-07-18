import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";
import { logEntityStatus } from "@/lib/server/talentFlow";

export const dynamic = "force-dynamic";

/** GET — shikoyatlar (yuboruvchi ma'lumoti bilan). */
export async function GET(): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const db = getDb();
  const { data } = await db
    .from("complaints")
    .select("id, user_id, subject, note, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as {
    id: string;
    user_id: string | null;
    subject: string | null;
    note: string | null;
    status: string;
    created_at: string;
  }[];

  const items = await Promise.all(
    rows.map(async (r) => {
      let who = "—";
      if (r.user_id) {
        const { data: u } = await db
          .from("users")
          .select("tg_id, username")
          .eq("id", r.user_id)
          .maybeSingle();
        const user = u as { tg_id: number; username: string | null } | null;
        if (user) who = user.username ? `@${user.username}` : String(user.tg_id);
        const { data: t } = await db
          .from("talents")
          .select("full_name")
          .eq("user_id", r.user_id)
          .maybeSingle();
        const name = (t as { full_name: string | null } | null)?.full_name;
        if (name) who = `${name} (${who})`;
      }
      return {
        id: r.id,
        who,
        subject: r.subject ?? "",
        note: r.note ?? "",
        status: r.status,
        createdAt: r.created_at,
      };
    }),
  );
  return NextResponse.json({ items });
}

/** POST { id, status: korildi|yopildi } */
export async function POST(req: Request): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { id?: string; status?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (!body.id || !["korildi", "yopildi"].includes(body.status ?? "")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const db = getDb();
  const { data } = await db
    .from("complaints")
    .select("status")
    .eq("id", body.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const old = (data as { status: string }).status;
  const { error } = await db
    .from("complaints")
    .update({ status: body.status })
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  await logEntityStatus({
    entity: "complaints",
    entityId: body.id,
    oldStatus: old,
    newStatus: body.status ?? "",
    changedBy: "admin-web",
  });
  return NextResponse.json({ ok: true });
}
