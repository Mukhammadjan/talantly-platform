import {
  ACTIVITY_TYPES_UZ,
  companiesRepo,
  statusLogRepo,
  type CompanyKind,
  type NeededLevel,
  type Urgency,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { notifyAdmin } from "@/lib/server/notify";
import { getSupabase } from "@/lib/server/supabase";
import { toCompanySnapshot } from "@/lib/server/talentPublic";
import { CITIES } from "@/lib/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: CompanyKind[] = ["kompaniya", "tashkilot", "startup", "shaxsiy"];
const LEVELS: NeededLevel[] = ["intern", "mutaxassis", "ikkalasi"];
const URGENCIES: Urgency[] = ["hoziroq", "oy_ichida", "korib_turibman"];

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();
    const client = getSupabase();
    const company = await companiesRepo.findByUserId(client, session.userId);
    return NextResponse.json({
      company: company ? toCompanySnapshot(company) : null,
    });
  } catch (err) {
    console.error("GET /api/company failed:", err);
    return serverError();
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return badRequest("So'rov ma'lumotlari noto'g'ri.");
    }
    const raw = body as {
      kind?: unknown;
      name?: unknown;
      city?: unknown;
      activityType?: unknown;
      neededLevel?: unknown;
      urgency?: unknown;
    };

    const kind = typeof raw.kind === "string" ? raw.kind : "";
    if (!KINDS.includes(kind as CompanyKind)) {
      return badRequest("Turini tanlang.");
    }
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (name.length < 2 || name.length > 100) {
      return badRequest("Nomni kiriting (2–100 harf).");
    }
    const city = typeof raw.city === "string" ? raw.city : "";
    if (!(CITIES as readonly string[]).includes(city)) {
      return badRequest("Shaharni ro'yxatdan tanlang.");
    }
    const activityType =
      typeof raw.activityType === "string" ? raw.activityType : "";
    if (!(ACTIVITY_TYPES_UZ as readonly string[]).includes(activityType)) {
      return badRequest("Faoliyat turini tanlang.");
    }
    const neededLevel =
      typeof raw.neededLevel === "string" ? raw.neededLevel : "";
    if (!LEVELS.includes(neededLevel as NeededLevel)) {
      return badRequest("Kerakli darajani tanlang.");
    }
    const urgency = typeof raw.urgency === "string" ? raw.urgency : "";
    if (!URGENCIES.includes(urgency as Urgency)) {
      return badRequest("Muddatni tanlang.");
    }

    const client = getSupabase();
    const existing = await companiesRepo.findByUserId(client, session.userId);
    if (existing) {
      return conflict("Siz allaqachon ro'yxatdan o'tgansiz.");
    }

    const company = await companiesRepo.insert(client, {
      name,
      user_id: session.userId,
      kind: kind as CompanyKind,
      city,
      activity_type: activityType,
      needed_level: neededLevel as NeededLevel,
      urgency: urgency as Urgency,
    });
    await statusLogRepo.insert(client, {
      entity: "company",
      entity_id: company.id,
      old_status: null,
      new_status: company.status,
      changed_by: session.userId,
    });

    await notifyAdmin(
      [
        "🏢 Yangi izlovchi ro'yxatdan o'tdi!",
        `🏷 Nomi: ${name}`,
        `📍 Shahar: ${city}`,
        `🧭 Faoliyat: ${activityType}`,
        `🎯 Kerak: ${neededLevel} · ${urgency}`,
      ].join("\n"),
    );

    return NextResponse.json({ company: toCompanySnapshot(company) });
  } catch (err) {
    console.error("POST /api/company failed:", err);
    return serverError();
  }
}
