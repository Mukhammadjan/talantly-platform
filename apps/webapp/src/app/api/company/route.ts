import { NextResponse } from "next/server";
import { ensureCompany, hasActiveSubscription } from "@/lib/server/companies";
import { getDb } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

const DIRECTIONS = ["dasturlash", "dizayn", "marketing", "sotuv", "data", "boshqa"];
const LEVELS = ["intern", "mutaxassis", "ikkalasi"];

interface CompanyRow {
  id: string;
  name: string;
  activity_type: string | null;
  city: string | null;
  district: string | null;
  description: string | null;
  logo_url: string | null;
  directions_needed: string[] | null;
  needed_level: string | null;
  is_verified: boolean | null;
}

function toView(c: CompanyRow): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    activityType: c.activity_type ?? "",
    city: c.city ?? "",
    district: c.district ?? "",
    about: c.description ?? "",
    logoUrl: c.logo_url,
    directions: c.directions_needed ?? [],
    neededLevel: c.needed_level ?? "",
    verified: Boolean(c.is_verified),
  };
}

const SELECT =
  "id, name, activity_type, city, district, description, logo_url, directions_needed, needed_level, is_verified";

export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const base = await ensureCompany(g.session);
  const db = getDb();
  const { data } = await db.from("companies").select(SELECT).eq("id", base.id).single();
  return NextResponse.json({
    company: toView(data as CompanyRow),
    subscriptionActive: await hasActiveSubscription(base.id),
  });
}

export async function PATCH(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const base = await ensureCompany(g.session);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim().length >= 2) {
    patch.name = body.name.trim().slice(0, 120);
  }
  if (typeof body.activityType === "string") {
    patch.activity_type = body.activityType.trim().slice(0, 120);
  }
  if (typeof body.city === "string") patch.city = body.city.trim().slice(0, 80);
  if (typeof body.district === "string") {
    patch.district = body.district.trim().slice(0, 80);
  }
  if (typeof body.about === "string") {
    patch.description = body.about.trim().slice(0, 2000);
  }
  if (Array.isArray(body.directions)) {
    patch.directions_needed = (body.directions as unknown[])
      .filter((d): d is string => typeof d === "string" && DIRECTIONS.includes(d))
      .slice(0, 6);
  }
  if (typeof body.neededLevel === "string" && LEVELS.includes(body.neededLevel)) {
    patch.needed_level = body.neededLevel;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "empty_patch" }, { status: 400 });
  }

  const db = getDb();
  const { data, error } = await db
    .from("companies")
    .update(patch)
    .eq("id", base.id)
    .select(SELECT)
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ company: toView(data as CompanyRow) });
}
