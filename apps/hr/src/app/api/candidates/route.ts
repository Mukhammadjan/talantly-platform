import { NextResponse } from "next/server";
import { talentView } from "@talantly/shared";
import { getDb } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

async function showDemo(): Promise<boolean> {
  const { data } = await getDb()
    .from("settings")
    .select("value")
    .eq("key", "show_demo_data")
    .maybeSingle();
  return ((data as { value: string } | null)?.value ?? "true").toLowerCase() === "true";
}

/** Tekshirilgan nomzodlar feed'i — filtr + sort + sahifalash. */
export async function GET(req: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const p = new URL(req.url).searchParams;
  const num = (k: string): number | null => {
    const v = Number(p.get(k));
    return Number.isFinite(v) && v > 0 ? v : null;
  };
  const sortParam = p.get("sort");
  const sort: "score" | "recent" | "salary" =
    sortParam === "salary" || sortParam === "recent" ? sortParam : "score";

  const result = await talentView.queryVerifiedTalents(getDb(), await showDemo(), {
    direction: p.get("direction"),
    level: p.get("level"),
    district: p.get("district"),
    minSalary: num("minSalary"),
    workFormat: p.get("workFormat"),
    search: p.get("q"),
    sort,
    limit: num("limit") ?? 24,
    offset: Number(p.get("offset")) || 0,
  });

  return NextResponse.json(result);
}
