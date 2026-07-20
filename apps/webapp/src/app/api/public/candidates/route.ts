import { NextResponse } from "next/server";
import { queryVerifiedTalents } from "@talantly/shared/talent-view";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

// Ochiq (guest) nomzodlar feed'i — auth talab qilinmaydi.
// Qisqa ism (Kamola O.) — to'liq ism/kontakt maxfiy. Demo toggle settings'dan.

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const sortParam = url.searchParams.get("sort");
  const sort: "score" | "recent" | "salary" =
    sortParam === "recent" || sortParam === "salary" ? sortParam : "score";

  try {
    const db = getDb();
    const { candidates, total } = await queryVerifiedTalents(db, await showDemo(), {
      direction: url.searchParams.get("direction"),
      level: url.searchParams.get("level"),
      minSalary: Number(url.searchParams.get("minSalary")) || null,
      search: url.searchParams.get("search"),
      sort,
      limit: 48,
    });
    return NextResponse.json({ candidates, total });
  } catch {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
