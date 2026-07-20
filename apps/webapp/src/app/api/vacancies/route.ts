import { NextResponse } from "next/server";
import type { SessionPayload } from "@/lib/server/auth";
import { requireUser } from "@/lib/server/guard";
import {
  ensureCompany,
  hasActiveSubscription,
} from "@/lib/server/companies";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

// Obunasiz kompaniya: maksimal faol vakansiya (E19).
const FREE_ACTIVE_LIMIT = 1;

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

/** Ish beruvchining o'z vakansiyalari — har biriga ariza sanog'i bilan. */
async function listMine(session: SessionPayload): Promise<NextResponse> {
  const db = getDb();
  const company = await ensureCompany(session);

  const { data, error } = await db
    .from("vacancies")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const rows = (data ?? []) as unknown as (VacancyRow & {
    status: string;
    created_at: string;
    salary_currency: string;
  })[];

  // Arizalarni bitta so'rovda olib, vakansiya bo'yicha sanaymiz.
  const ids = rows.map((r) => r.id);
  const counts = new Map<string, { total: number; fresh: number }>();
  if (ids.length > 0) {
    const { data: reqs } = await db
      .from("requests")
      .select("vacancy_id, status")
      .eq("kind", "talant_qiziqishi")
      .in("vacancy_id", ids);
    for (const r of (reqs ?? []) as { vacancy_id: string; status: string }[]) {
      const c = counts.get(r.vacancy_id) ?? { total: 0, fresh: 0 };
      c.total += 1;
      if (r.status === "yangi") c.fresh += 1;
      counts.set(r.vacancy_id, c);
    }
  }

  return NextResponse.json({
    vacancies: rows.map((v) => ({
      ...toClient(v),
      status: v.status,
      createdAt: v.created_at,
      applications: counts.get(v.id) ?? { total: 0, fresh: 0 },
    })),
  });
}

/** Faol vakansiyalar (demo toggle bilan). ?id= bilan bitta, ?mine=1 — o'zimniki. */
export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const url = new URL(req.url);
  if (url.searchParams.get("mine") === "1") return listMine(g.session);

  const id = url.searchParams.get("id");
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
  const g = await requireUser(req);
  if (!g.ok) return g.res;
  const session = g.session;

  let body: {
    title?: unknown;
    direction?: unknown;
    level?: unknown;
    salaryFrom?: unknown;
    salaryTo?: unknown;
    workFormats?: unknown;
    description?: unknown;
    city?: unknown;
    district?: unknown;
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
  const city =
    typeof body.city === "string" && body.city.trim()
      ? body.city.trim().slice(0, 80)
      : "Toshkent";
  const district =
    typeof body.district === "string" ? body.district.trim().slice(0, 80) : "";

  const company = await ensureCompany(session);

  // Vakansiya limiti (E19): obunasiz maks 1 faol vakansiya.
  if (!(await hasActiveSubscription(company.id))) {
    const { count } = await getDb()
      .from("vacancies")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company.id)
      .eq("status", "faol");
    if ((count ?? 0) >= FREE_ACTIVE_LIMIT) {
      return NextResponse.json({ error: "vacancy_limit" }, { status: 403 });
    }
  }

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
      city,
      district: district || null,
      work_formats: workFormats,
      status: "faol",
      is_demo: false,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ id: (created as { id: string }).id });
}
