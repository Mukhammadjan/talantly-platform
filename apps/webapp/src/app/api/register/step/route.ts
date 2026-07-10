import {
  SKILL_TAG_BANK,
  talentsRepo,
  usersRepo,
  type Direction,
  type TalentInsert,
  type TalentLevel,
  type TalentRow,
  type WorkFormat,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { buildSnapshot, loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";
import {
  BIRTH_YEAR_MAX,
  BIRTH_YEAR_MIN,
  CITIES,
  DIRECTIONS,
  EXPERIENCE_YEARS_MAX,
  MAX_SKILL_TAGS,
  PHONE_REGEX,
  TOTAL_STEPS,
} from "@/lib/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StepResult =
  | { ok: true; talentFields?: Partial<TalentInsert>; phone?: string }
  | { ok: false; message: string };

const WORK_FORMAT_VALUES: WorkFormat[] = ["ofis", "masofaviy", "aralash"];

function validateStep(
  step: number,
  value: unknown,
  talent: TalentRow,
): StepResult {
  switch (step) {
    case 1: {
      const name = typeof value === "string" ? value.trim() : "";
      if (name.length < 3 || name.length > 100) {
        return { ok: false, message: "Ism-familiya 3–100 harf bo'lsin." };
      }
      return { ok: true, talentFields: { full_name: name } };
    }
    case 2: {
      const year = typeof value === "number" ? value : NaN;
      if (
        !Number.isInteger(year) ||
        year < BIRTH_YEAR_MIN ||
        year > BIRTH_YEAR_MAX
      ) {
        return {
          ok: false,
          message: `Tug'ilgan yil ${BIRTH_YEAR_MIN}–${BIRTH_YEAR_MAX} oralig'ida bo'lsin.`,
        };
      }
      return { ok: true, talentFields: { birth_year: year } };
    }
    case 3: {
      const city = typeof value === "string" ? value : "";
      if (!(CITIES as readonly string[]).includes(city)) {
        return { ok: false, message: "Shaharni ro'yxatdan tanlang." };
      }
      return { ok: true, talentFields: { city } };
    }
    case 4: {
      const direction = typeof value === "string" ? value : "";
      if (!DIRECTIONS.some((d) => d.value === direction)) {
        return { ok: false, message: "Yo'nalishni ro'yxatdan tanlang." };
      }
      const fields: Partial<TalentInsert> = {
        direction: direction as Direction,
      };
      // Direction change invalidates previously chosen tags.
      if (talent.direction && talent.direction !== direction) {
        fields.skill_tags = [];
      }
      return { ok: true, talentFields: fields };
    }
    case 5: {
      if (!talent.direction) {
        return { ok: false, message: "Avval yo'nalishni tanlang." };
      }
      const bank = SKILL_TAG_BANK[talent.direction];
      const tags =
        Array.isArray(value) && value.every((t) => typeof t === "string")
          ? (value as string[])
          : null;
      if (!tags || tags.length < 1 || tags.length > MAX_SKILL_TAGS) {
        return {
          ok: false,
          message: `1 tadan ${MAX_SKILL_TAGS} tagacha ko'nikma tanlang.`,
        };
      }
      if (new Set(tags).size !== tags.length || tags.some((t) => !bank.includes(t))) {
        return { ok: false, message: "Ko'nikmalarni ro'yxatdan tanlang." };
      }
      return { ok: true, talentFields: { skill_tags: tags } };
    }
    case 6: {
      const level = typeof value === "string" ? value : "";
      if (level !== "intern" && level !== "mutaxassis") {
        return { ok: false, message: "Darajani tanlang." };
      }
      const fields: Partial<TalentInsert> = { level: level as TalentLevel };
      if (level === "intern") fields.experience_years = null;
      return { ok: true, talentFields: fields };
    }
    case 7: {
      if (talent.level !== "mutaxassis") {
        return { ok: false, message: "Bu qadam faqat mutaxassislar uchun." };
      }
      const raw =
        value && typeof value === "object"
          ? (value as { years?: unknown; where?: unknown })
          : {};
      const years = typeof raw.years === "number" ? raw.years : NaN;
      const where = typeof raw.where === "string" ? raw.where.trim() : "";
      if (
        !Number.isInteger(years) ||
        years < 1 ||
        years > EXPERIENCE_YEARS_MAX
      ) {
        return { ok: false, message: "Tajriba yillarini tanlang." };
      }
      if (where.length < 2 || where.length > 200) {
        return {
          ok: false,
          message: "Qayerda ishlaganingizni qisqacha yozing (2–200 harf).",
        };
      }
      const fields: Partial<TalentInsert> = { experience_years: years };
      // Seed the free-text step so the experience detail reaches the CV.
      if (!talent.free_text) {
        fields.free_text = `Ish tajribasi: ${where}.`;
      }
      return { ok: true, talentFields: fields };
    }
    case 8: {
      const formats =
        Array.isArray(value) && value.every((f) => typeof f === "string")
          ? (value as string[])
          : null;
      if (
        !formats ||
        formats.length < 1 ||
        new Set(formats).size !== formats.length ||
        formats.some((f) => !WORK_FORMAT_VALUES.includes(f as WorkFormat))
      ) {
        return { ok: false, message: "Kamida bitta ish formatini tanlang." };
      }
      return {
        ok: true,
        talentFields: { work_formats: formats as WorkFormat[] },
      };
    }
    case 9: {
      const headline = typeof value === "string" ? value.trim() : "";
      if (headline.length < 5 || headline.length > 80) {
        return {
          ok: false,
          message: "O'zingiz haqingizda bitta qisqa jumla yozing (5–80 harf).",
        };
      }
      return { ok: true, talentFields: { headline } };
    }
    case 10: {
      const education = typeof value === "string" ? value.trim() : "";
      if (education.length < 2 || education.length > 200) {
        return { ok: false, message: "Ta'lim haqida 2–200 harf yozing." };
      }
      return { ok: true, talentFields: { education } };
    }
    case 11: {
      const phone = typeof value === "string" ? value.replace(/\s/g, "") : "";
      if (!PHONE_REGEX.test(phone)) {
        return {
          ok: false,
          message: "Telefon raqam +998 bilan, 9 ta raqam bo'lsin.",
        };
      }
      return { ok: true, phone };
    }
    case 12: {
      const text = typeof value === "string" ? value.trim() : "";
      if (text.length < 10 || text.length > 2000) {
        return {
          ok: false,
          message: "Kamida 10 ta harf yozing — bu CV uchun juda muhim.",
        };
      }
      return { ok: true, talentFields: { free_text: text } };
    }
    case 13: {
      if (value === null || value === "") {
        return { ok: true, talentFields: { portfolio_url: null } };
      }
      const url = typeof value === "string" ? value.trim() : "";
      if (!/^https?:\/\/\S+\.\S+/.test(url) || url.length > 300) {
        return {
          ok: false,
          message: "Havola http:// yoki https:// bilan boshlanishi kerak.",
        };
      }
      return { ok: true, talentFields: { portfolio_url: url } };
    }
    default:
      return { ok: false, message: "Noto'g'ri qadam." };
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
    const { step, value } = body as { step?: unknown; value?: unknown };
    if (
      typeof step !== "number" ||
      !Number.isInteger(step) ||
      step < 1 ||
      step > TOTAL_STEPS
    ) {
      return badRequest("Noto'g'ri qadam.");
    }

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();
    if (context.talent.status !== "yangi") {
      return conflict("Ro'yxatdan o'tish allaqachon yakunlangan.");
    }

    const result = validateStep(step, value, context.talent);
    if (!result.ok) return badRequest(result.message);

    let talent = context.talent;
    let user = context.user;
    if (result.talentFields) {
      talent = await talentsRepo.updateFields(
        client,
        talent.id,
        result.talentFields,
      );
    }
    if (result.phone) {
      user = await usersRepo.updateFields(client, user.id, {
        phone: result.phone,
      });
    }

    // Interns skip the experience screen (step 7).
    const skipExperience = step === 6 && talent.level === "intern";
    const nextStep = Math.min(step + (skipExperience ? 2 : 1), TOTAL_STEPS);
    talent = await talentsRepo.updateBotState(client, talent.id, {
      step: "register",
      data: { registerStep: nextStep },
    });

    const snapshot = await buildSnapshot(client, user, talent);
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("POST /api/register/step failed:", err);
    return serverError();
  }
}
