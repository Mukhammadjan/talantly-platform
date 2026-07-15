import type { TalentInsert } from "@talantly/shared";
import { SALARY_CURRENCIES } from "@/lib/apiTypes";
import {
  CITIES,
  DIRECTIONS,
  EXPERIENCE_YEARS_MAX,
  LEVELS,
  MAX_SKILL_TAGS,
  WORK_FORMATS,
} from "@/lib/registration";

const CITY_VALUES = new Set<string>(CITIES);
const DIRECTION_VALUES = new Set<string>(DIRECTIONS.map((d) => d.value));
const LEVEL_VALUES = new Set<string>(LEVELS.map((l) => l.value));
const WORK_FORMAT_VALUES = new Set<string>(WORK_FORMATS.map((w) => w.value));
const CURRENCY_VALUES = new Set<string>(SALARY_CURRENCIES);

const MAX_HEADLINE = 90;
const MAX_FREE_TEXT = 800;
const MAX_SALARY = 100_000_000;

export type ProfileValidation =
  | { ok: true; fields: Partial<TalentInsert> }
  | { ok: false; error: string };

function fail(error: string): ProfileValidation {
  return { ok: false, error };
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}

/**
 * Validates a talent's self-edit payload and maps it to DB columns. Only the
 * fields a talent owns are accepted; status, verification and identity stay
 * untouched. Never trusts the client — every field is re-checked here.
 */
export function validateProfileEdit(input: unknown): ProfileValidation {
  if (!input || typeof input !== "object") {
    return fail("Ma'lumot yuborilmadi.");
  }
  const p = input as Record<string, unknown>;

  const fullName = typeof p.fullName === "string" ? p.fullName.trim() : "";
  if (fullName.length < 2 || fullName.length > 80) {
    return fail("Ism 2 dan 80 belgigacha bo'lishi kerak.");
  }

  if (typeof p.city !== "string" || !CITY_VALUES.has(p.city)) {
    return fail("Shahar noto'g'ri tanlangan.");
  }

  if (typeof p.direction !== "string" || !DIRECTION_VALUES.has(p.direction)) {
    return fail("Yo'nalish noto'g'ri tanlangan.");
  }

  if (typeof p.level !== "string" || !LEVEL_VALUES.has(p.level)) {
    return fail("Daraja noto'g'ri tanlangan.");
  }
  const level = p.level as "intern" | "mutaxassis";

  // Experience only applies to mutaxassis; interns are always null.
  let experienceYears: number | null = null;
  if (level === "mutaxassis" && p.experienceYears != null) {
    const years = Number(p.experienceYears);
    if (
      !Number.isInteger(years) ||
      years < 0 ||
      years > EXPERIENCE_YEARS_MAX
    ) {
      return fail(`Tajriba 0 dan ${EXPERIENCE_YEARS_MAX} yilgacha bo'lishi kerak.`);
    }
    experienceYears = years;
  }

  const skillTags = cleanStringArray(p.skillTags);
  if (skillTags.length > MAX_SKILL_TAGS) {
    return fail(`Ko'pi bilan ${MAX_SKILL_TAGS} ta ko'nikma tanlang.`);
  }

  const workFormats = cleanStringArray(p.workFormats);
  if (workFormats.some((f) => !WORK_FORMAT_VALUES.has(f))) {
    return fail("Ish formati noto'g'ri.");
  }

  const headlineRaw =
    typeof p.headline === "string" ? p.headline.trim() : "";
  if (headlineRaw.length > MAX_HEADLINE) {
    return fail(`Iboraning uzunligi ${MAX_HEADLINE} belgidan oshmasin.`);
  }

  const freeTextRaw =
    typeof p.freeText === "string" ? p.freeText.trim() : "";
  if (freeTextRaw.length > MAX_FREE_TEXT) {
    return fail(`Tavsif ${MAX_FREE_TEXT} belgidan oshmasin.`);
  }

  let portfolioUrl: string | null = null;
  if (typeof p.portfolioUrl === "string" && p.portfolioUrl.trim()) {
    const url = p.portfolioUrl.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) {
      return fail("Portfolio havolasi http:// yoki https:// bilan boshlanishi kerak.");
    }
    portfolioUrl = url;
  }

  let salaryFrom: number | null = null;
  if (p.salaryFrom != null && p.salaryFrom !== "") {
    const salary = Number(p.salaryFrom);
    if (!Number.isInteger(salary) || salary < 0 || salary > MAX_SALARY) {
      return fail("Maosh qiymati noto'g'ri.");
    }
    salaryFrom = salary;
  }

  const salaryCurrency =
    typeof p.salaryCurrency === "string" && CURRENCY_VALUES.has(p.salaryCurrency)
      ? p.salaryCurrency
      : "UZS";

  return {
    ok: true,
    fields: {
      full_name: fullName,
      city: p.city,
      direction: p.direction as TalentInsert["direction"],
      level,
      experience_years: experienceYears,
      skill_tags: skillTags,
      work_formats: workFormats as TalentInsert["work_formats"],
      headline: headlineRaw || null,
      free_text: freeTextRaw || null,
      portfolio_url: portfolioUrl,
      salary_from: salaryFrom,
      salary_currency: salaryCurrency,
    },
  };
}
