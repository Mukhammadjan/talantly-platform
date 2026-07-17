import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/** Bo'sh kelgusi suhbat slotlari. */
export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const { data, error } = await getDb()
    .from("interview_slots")
    .select("id, starts_at")
    .eq("is_taken", false)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(30);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ slots: data ?? [] });
}
