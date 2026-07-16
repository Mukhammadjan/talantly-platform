import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import {
  buildSnapshot,
  ensureTalent,
  setTalentStatus,
} from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const DIRECTIONS = ["dasturlash", "dizayn", "marketing", "sotuv", "data", "boshqa"];
const LEVELS = ["intern", "mutaxassis"];
const FORMATS = ["ofis", "masofaviy", "aralash"];

export async function GET(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const talent = await ensureTalent(session);
  return NextResponse.json(await buildSnapshot(talent));
}

interface ProfileBody {
  fullName?: string;
  birthYear?: number | null;
  city?: string | null;
  district?: string | null;
  direction?: string | null;
  level?: string | null;
  experienceYears?: number | null;
  skills?: string[];
  workFormats?: string[];
  salaryFrom?: number | null;
  about?: string | null;
  portfolioUrl?: string | null;
}

/** Talant FAQAT o'z qatorini yozadi (ownership = sessiyadagi userId). */
export async function PATCH(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: ProfileBody;
  try {
    body = (await req.json()) as ProfileBody;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.fullName === "string" && body.fullName.trim().length >= 2) {
    patch.full_name = body.fullName.trim().slice(0, 120);
  }
  if (body.birthYear === null || typeof body.birthYear === "number") {
    if (body.birthYear === null) patch.birth_year = null;
    else if (body.birthYear >= 1985 && body.birthYear <= 2012)
      patch.birth_year = Math.trunc(body.birthYear);
  }
  if (typeof body.city === "string") patch.city = body.city.slice(0, 80);
  if (typeof body.district === "string") patch.district = body.district.slice(0, 80);
  if (typeof body.direction === "string" && DIRECTIONS.includes(body.direction)) {
    patch.direction = body.direction;
  }
  if (typeof body.level === "string" && LEVELS.includes(body.level)) {
    patch.level = body.level;
  }
  if (body.experienceYears === null) patch.experience_years = null;
  else if (
    typeof body.experienceYears === "number" &&
    body.experienceYears >= 0 &&
    body.experienceYears <= 50
  ) {
    patch.experience_years = Math.trunc(body.experienceYears);
  }
  if (Array.isArray(body.skills)) {
    patch.skill_tags = body.skills
      .filter((s): s is string => typeof s === "string")
      .slice(0, 20)
      .map((s) => s.slice(0, 40));
  }
  if (Array.isArray(body.workFormats)) {
    patch.work_formats = body.workFormats.filter(
      (f): f is string => typeof f === "string" && FORMATS.includes(f),
    );
  }
  if (body.salaryFrom === null) patch.salary_from = null;
  else if (
    typeof body.salaryFrom === "number" &&
    body.salaryFrom >= 0 &&
    body.salaryFrom <= 1_000_000_000
  ) {
    patch.salary_from = Math.trunc(body.salaryFrom);
  }
  if (typeof body.about === "string") patch.free_text = body.about.slice(0, 1000);
  if (typeof body.portfolioUrl === "string") {
    patch.portfolio_url = body.portfolioUrl.slice(0, 300);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "empty_patch" }, { status: 400 });
  }

  const talent = await ensureTalent(session);
  const db = getDb();
  const { error } = await db.from("talents").update(patch).eq("id", talent.id);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  // Birinchi to'liq saqlashda: yangi → malumot_toldirilgan (+status_log).
  const complete =
    (patch.full_name ?? talent.full_name) &&
    (patch.direction ?? talent.direction) &&
    (patch.level ?? talent.level);
  if (talent.status === "yangi" && complete) {
    await setTalentStatus(talent, "malumot_toldirilgan", `tg:${session.tgId}`);
  }

  const { data: fresh } = await db
    .from("talents")
    .select("*")
    .eq("id", talent.id)
    .single();
  return NextResponse.json(
    await buildSnapshot((fresh ?? talent) as typeof talent),
  );
}
