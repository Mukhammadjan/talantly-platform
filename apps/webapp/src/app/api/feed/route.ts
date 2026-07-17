import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { latestScores, toCandidate } from "@/lib/server/candidates";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";
import type { TalentRowV2 } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

/** Tekshirilgan nomzodlar feed'i — demo toggle har o'qishda settings'dan. */
export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const db = getDb();
  let query = db
    .from("talents")
    .select("*")
    .eq("status", "tekshirilgan")
    .eq("is_hidden", false)
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
