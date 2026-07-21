import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

// Ochiq (guest) bitta vakansiya + kompaniya + o'xshash tavsiyalar.

interface VacancyRow {
  id: string;
  company_id: string | null;
  title: string;
  direction: string;
  level: string;
  salary_from: number | null;
  salary_to: number | null;
  salary_currency: string | null;
  description: string | null;
  city: string | null;
  district: string | null;
  work_formats: string[] | null;
  is_demo: boolean;
  status: string;
  created_at: string;
  companies: {
    name: string;
    is_verified: boolean;
    logo_url: string | null;
    activity_type: string | null;
    description: string | null;
  } | null;
}

function view(v: VacancyRow): Record<string, unknown> {
  const lines = (v.description ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: v.id,
    company: v.companies?.name ?? "Kompaniya",
    verified: v.companies?.is_verified ?? false,
    logoUrl: v.companies?.logo_url ?? null,
    companyActivity: v.companies?.activity_type ?? null,
    companyAbout: v.companies?.description ?? null,
    title: v.title,
    direction: v.direction,
    level: v.level,
    salaryFrom: v.salary_from,
    salaryTo: v.salary_to,
    salaryCurrency: v.salary_currency ?? "UZS",
    city: v.city ?? "Toshkent",
    district: v.district ?? "",
    workFormats: v.work_formats ?? [],
    description: lines,
    createdAt: v.created_at,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const db = getDb();
  const { data, error } = await db
    .from("vacancies")
    .select(
      "id, company_id, title, direction, level, salary_from, salary_to, salary_currency, description, city, district, work_formats, is_demo, status, created_at, companies(name, is_verified, logo_url, activity_type, description)",
    )
    .eq("id", params.id)
    .eq("status", "faol")
    .maybeSingle();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  const v = data as unknown as VacancyRow | null;
  if (!v || (v.is_demo && !(await showDemo()))) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // O'xshash tavsiyalar: avval bir yo'nalish, yetmasa boshqa faol vakansiyalar
  // bilan to'ldiramiz (sidebar bo'sh qolmasin). O'zidan boshqa, faol.
  const RECO_SELECT =
    "id, title, direction, level, salary_from, salary_to, salary_currency, description, city, district, work_formats, is_demo, created_at, companies(name, is_verified, logo_url)";
  const hideDemo = !(await showDemo());
  const RECO_LIMIT = 4;

  const sameDirQ = db
    .from("vacancies")
    .select(RECO_SELECT)
    .eq("status", "faol")
    .eq("direction", v.direction)
    .neq("id", v.id)
    .order("created_at", { ascending: false })
    .limit(RECO_LIMIT);
  const { data: sameDir } = await (hideDemo
    ? sameDirQ.eq("is_demo", false)
    : sameDirQ);

  const recoRows = [...((sameDir ?? []) as unknown as VacancyRow[])];

  if (recoRows.length < RECO_LIMIT) {
    const excludeIds = [v.id, ...recoRows.map((r) => r.id)];
    const fillQ = db
      .from("vacancies")
      .select(RECO_SELECT)
      .eq("status", "faol")
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(RECO_LIMIT - recoRows.length);
    const { data: fill } = await (hideDemo
      ? fillQ.eq("is_demo", false)
      : fillQ);
    recoRows.push(...((fill ?? []) as unknown as VacancyRow[]));
  }

  const recommendations = recoRows.map(view);

  return NextResponse.json({ vacancy: view(v), recommendations });
}
