import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
import { latestScores, toCandidate } from "@/lib/server/candidates";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";
import type { TalentRowV2 } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

/** Tekshirilgan nomzodlar feed'i — demo toggle har o'qishda settings'dan. */
export async function GET(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = getDb();
  let query = db
    .from("talents")
    .select("*")
    .eq("status", "tekshirilgan")
    .order("created_at", { ascending: false })
    .limit(50);
  if (!(await showDemo())) {
    query = query.eq("is_demo", false);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const talents = (data ?? []) as TalentRowV2[];
  const scores = await latestScores(talents.map((t) => t.id));
  const candidates = talents.map((t) =>
    toCandidate(t, scores.get(t.id) ?? null),
  );
  return NextResponse.json({ candidates });
}
