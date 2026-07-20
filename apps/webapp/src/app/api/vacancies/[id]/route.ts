import { NextResponse } from "next/server";
import { ensureCompany, hasActiveSubscription } from "@/lib/server/companies";
import { getDb, logStatus } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

const DIRECTIONS = ["dasturlash", "dizayn", "marketing", "sotuv", "data", "boshqa"];
const LEVELS = ["intern", "mutaxassis", "ikkalasi"];
const FORMATS = ["ofis", "masofaviy", "aralash"];
const STATUSES = ["faol", "yopilgan", "qoralama"];

// Obunasiz kompaniya: maksimal faol vakansiya (E19) — /api/vacancies bilan bir xil.
const FREE_ACTIVE_LIMIT = 1;

interface Row {
  id: string;
  company_id: string;
  title: string;
  direction: string;
  level: string;
  salary_from: number | null;
  salary_to: number | null;
  description: string | null;
  city: string | null;
  district: string | null;
  work_formats: string[];
  status: string;
  is_demo: boolean;
  created_at: string;
}

function toClient(v: Row): Record<string, unknown> {
  return {
    id: v.id,
    title: v.title,
    direction: v.direction,
    level: v.level,
    salaryFrom: v.salary_from,
    salaryTo: v.salary_to,
    description: v.description ?? "",
    city: v.city ?? "",
    district: v.district ?? "",
    workFormats: v.work_formats ?? [],
    status: v.status,
    isDemo: v.is_demo,
    createdAt: v.created_at,
  };
}

/** Vakansiyani o'qiydi va so'rovchi shu vakansiya egasi ekanini tekshiradi. */
async function loadOwned(
  req: Request,
  id: string,
): Promise<
  | { ok: true; row: Row; tgId: number }
  | { ok: false; res: NextResponse }
> {
  const g = await requireUser(req);
  if (!g.ok) return { ok: false, res: g.res };

  const company = await ensureCompany(g.session);
  const { data } = await getDb()
    .from("vacancies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const row = data as Row | null;
  if (!row) {
    return {
      ok: false,
      res: NextResponse.json({ error: "not_found" }, { status: 404 }),
    };
  }
  if (row.company_id !== company.id) {
    return {
      ok: false,
      res: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, row, tgId: g.session.tgId };
}

/** O'z vakansiyasi — tahrirlash formasi uchun. */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const o = await loadOwned(req, params.id);
  if (!o.ok) return o.res;
  return NextResponse.json({ vacancy: toClient(o.row) });
}

/** Tahrirlash va holatni o'zgartirish (faol / yopilgan / qoralama). */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const o = await loadOwned(req, params.id);
  if (!o.ok) return o.res;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length < 2) {
      return NextResponse.json({ error: "title_required" }, { status: 400 });
    }
    patch.title = body.title.trim().slice(0, 140);
  }
  if (body.direction !== undefined) {
    if (typeof body.direction !== "string" || !DIRECTIONS.includes(body.direction)) {
      return NextResponse.json({ error: "bad_direction" }, { status: 400 });
    }
    patch.direction = body.direction;
  }
  if (body.level !== undefined && typeof body.level === "string") {
    if (!LEVELS.includes(body.level)) {
      return NextResponse.json({ error: "bad_level" }, { status: 400 });
    }
    patch.level = body.level;
  }
  if (body.salaryFrom !== undefined) {
    patch.salary_from =
      typeof body.salaryFrom === "number" && body.salaryFrom > 0
        ? Math.trunc(body.salaryFrom)
        : null;
  }
  if (body.salaryTo !== undefined) {
    patch.salary_to =
      typeof body.salaryTo === "number" && body.salaryTo > 0
        ? Math.trunc(body.salaryTo)
        : null;
  }
  if (body.workFormats !== undefined) {
    patch.work_formats = Array.isArray(body.workFormats)
      ? body.workFormats.filter(
          (f): f is string => typeof f === "string" && FORMATS.includes(f),
        )
      : [];
  }
  if (body.description !== undefined) {
    patch.description =
      typeof body.description === "string"
        ? body.description.slice(0, 1500)
        : null;
  }
  if (body.city !== undefined && typeof body.city === "string") {
    patch.city = body.city.trim().slice(0, 80) || "Toshkent";
  }
  if (body.district !== undefined && typeof body.district === "string") {
    patch.district = body.district.trim().slice(0, 80) || null;
  }

  let statusChanged: string | null = null;
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "bad_status" }, { status: 400 });
    }
    // Yopilganni qayta ochish ham limitga bo'ysunadi (E19).
    if (body.status === "faol" && o.row.status !== "faol") {
      if (!(await hasActiveSubscription(o.row.company_id))) {
        const { count } = await getDb()
          .from("vacancies")
          .select("id", { count: "exact", head: true })
          .eq("company_id", o.row.company_id)
          .eq("status", "faol");
        if ((count ?? 0) >= FREE_ACTIVE_LIMIT) {
          return NextResponse.json({ error: "vacancy_limit" }, { status: 403 });
        }
      }
    }
    if (body.status !== o.row.status) statusChanged = body.status;
    patch.status = body.status;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ vacancy: toClient(o.row) });
  }

  const { data, error } = await getDb()
    .from("vacancies")
    .update(patch)
    .eq("id", o.row.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  if (statusChanged) {
    await logStatus({
      entity: "vacancies",
      entityId: o.row.id,
      oldStatus: o.row.status,
      newStatus: statusChanged,
      changedBy: `tg:${o.tgId}`,
    });
  }

  return NextResponse.json({ vacancy: toClient(data as Row) });
}
