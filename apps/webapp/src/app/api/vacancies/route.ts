import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
import { ensureCompany } from "@/lib/server/companies";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

const DIRECTIONS = ["dasturlash", "dizayn", "marketing", "sotuv", "data", "boshqa"];
const LEVELS = ["intern", "mutaxassis", "ikkalasi"];
const FORMATS = ["ofis", "masofaviy", "aralash"];

interface VacancyRow {
  id: string;
  title: string;
  direction: string;
  level: string;
  salary_from: number | null;
  salary_to: number | null;
  description: string | null;
  city: string | null;
  district: string | null;
  work_formats: string[];
  is_demo: boolean;
  companies: { name: string } | null;
}

function toClient(v: VacancyRow): Record<string, unknown> {
  return {
    id: v.id,
    company: v.companies?.name ?? "Kompaniya",
    title: v.title,
    direction: v.direction,
    level: v.level,
    salaryFrom: v.salary_from ?? 0,
    salaryTo: v.salary_to,
    city: v.city ?? "Toshkent",
    district: v.district ?? "",
    workFormats: v.work_formats ?? [],
    description: (v.description ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    requirements: [],
    isDemo: v.is_demo,
  };
}

/** Faol vakansiyalar (demo toggle bilan). ?id= bilan bitta. */
export async function GET(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  const db = getDb();
  let query = db
    .from("vacancies")
    .select("*, companies(name)")
    .eq("status", "faol")
    .order("created_at", { ascending: false })
    .limit(50);
  if (id) query = query.eq("id", id);
  if (!(await showDemo())) query = query.eq("is_demo", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const rows = (data ?? []) as unknown as VacancyRow[];
  return NextResponse.json({ vacancies: rows.map(toClient) });
}

/** Vakansiya yaratish — o'z kompaniyasi nomidan. */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: {
    title?: unknown;
    direction?: unknown;
    level?: unknown;
    salaryFrom?: unknown;
    salaryTo?: unknown;
    workFormats?: unknown;
    description?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (typeof body.title !== "string" || body.title.trim().length < 2) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  if (typeof body.direction !== "string" || !DIRECTIONS.includes(body.direction)) {
    return NextResponse.json({ error: "bad_direction" }, { status: 400 });
  }
  const level =
    typeof body.level === "string" && LEVELS.includes(body.level)
      ? body.level
      : "ikkalasi";
  const salaryFrom =
    typeof body.salaryFrom === "number" && body.salaryFrom > 0
      ? Math.trunc(body.salaryFrom)
      : null;
  const salaryTo =
    typeof body.salaryTo === "number" && body.salaryTo > 0
      ? Math.trunc(body.salaryTo)
      : null;
  const workFormats = Array.isArray(body.workFormats)
    ? body.workFormats.filter(
        (f): f is string => typeof f === "string" && FORMATS.includes(f),
      )
    : [];
  const description =
    typeof body.description === "string" ? body.description.slice(0, 1500) : null;

  const company = await ensureCompany(session);
  const { data: created, error } = await getDb()
    .from("vacancies")
    .insert({
      company_id: company.id,
      title: body.title.trim().slice(0, 140),
      direction: body.direction,
      level,
      salary_from: salaryFrom,
      salary_to: salaryTo,
      description,
      city: "Toshkent",
      work_formats: workFormats,
      status: "faol",
      is_demo: false,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ id: (created as { id: string }).id });
}
