import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

// Ochiq (guest) vakansiya ro'yxati — auth talab qilinmaydi.
// Faqat status=faol; demo toggle settings'dan; kompaniya join.

interface VacancyRow {
  id: string;
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
  created_at: string;
  companies: { name: string; is_verified: boolean; logo_url: string | null } | null;
}

function toView(v: VacancyRow): Record<string, unknown> {
  const lines = (v.description ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: v.id,
    company: v.companies?.name ?? "Kompaniya",
    verified: v.companies?.is_verified ?? false,
    logoUrl: v.companies?.logo_url ?? null,
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

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const direction = url.searchParams.get("direction");
  const level = url.searchParams.get("level");
  const workFormat = url.searchParams.get("workFormat");
  const minSalary = Number(url.searchParams.get("minSalary")) || 0;
  const search = (url.searchParams.get("search") ?? "").trim();
  const sort = url.searchParams.get("sort") ?? "recent";

  const db = getDb();
  let q = db
    .from("vacancies")
    .select(
      "id, title, direction, level, salary_from, salary_to, salary_currency, description, city, district, work_formats, is_demo, created_at, companies(name, is_verified, logo_url)",
    )
    .eq("status", "faol");
  if (!(await showDemo())) q = q.eq("is_demo", false);
  if (direction) q = q.eq("direction", direction);
  if (level) q = q.or(`level.eq.${level},level.eq.ikkalasi`);
  if (workFormat) q = q.contains("work_formats", [workFormat]);
  if (minSalary > 0) q = q.gte("salary_from", minSalary);
  if (search) {
    const s = search.replace(/[%,]/g, "");
    q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`);
  }
  if (sort === "salary") {
    q = q.order("salary_from", { ascending: false, nullsFirst: false });
  } else {
    q = q.order("created_at", { ascending: false });
  }
  q = q.limit(60);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  const vacancies = ((data ?? []) as unknown as VacancyRow[]).map(toView);
  return NextResponse.json({ vacancies, total: vacancies.length });
}
