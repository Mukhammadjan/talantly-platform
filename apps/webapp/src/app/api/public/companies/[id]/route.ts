import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

// Ochiq (guest) kompaniya detali + uning faol vakansiyalari.

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
  is_verified: boolean;
  is_demo: boolean;
  created_at: string;
}

interface VacancyRow {
  id: string;
  title: string;
  direction: string;
  level: string;
  salary_from: number | null;
  salary_to: number | null;
  city: string | null;
  district: string | null;
  work_formats: string[] | null;
  created_at: string;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const db = getDb();
  const demoOn = await showDemo();

  const { data: c } = await db
    .from("companies")
    .select(
      "id, name, activity_type, city, district, description, logo_url, directions_needed, needed_level, is_verified, is_demo, created_at",
    )
    .eq("id", params.id)
    .maybeSingle();
  const company = c as CompanyRow | null;
  if (!company || (company.is_demo && !demoOn)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let vq = db
    .from("vacancies")
    .select(
      "id, title, direction, level, salary_from, salary_to, city, district, work_formats, created_at",
    )
    .eq("company_id", company.id)
    .eq("status", "faol")
    .order("created_at", { ascending: false })
    .limit(20);
  if (!demoOn) vq = vq.eq("is_demo", false);
  const { data: vacRows } = await vq;
  const vacancies = ((vacRows ?? []) as unknown as VacancyRow[]).map((v) => ({
    id: v.id,
    title: v.title,
    direction: v.direction,
    level: v.level,
    salaryFrom: v.salary_from,
    salaryTo: v.salary_to,
    city: v.city ?? "",
    district: v.district ?? "",
    workFormats: v.work_formats ?? [],
    createdAt: v.created_at,
  }));

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      verified: company.is_verified,
      logoUrl: company.logo_url,
      activity: company.activity_type ?? "",
      city: company.city ?? "",
      district: company.district ?? "",
      about: (company.description ?? "").trim(),
      directions: company.directions_needed ?? [],
      neededLevel: company.needed_level ?? "",
    },
    vacancies,
  });
}
