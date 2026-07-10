import type { Direction, TalentLevel, WorkFormat } from "@talantly/shared";

export const CITIES = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Farg'ona",
  "Andijon",
  "Namangan",
  "Boshqa",
] as const;

export const DIRECTIONS: { value: Direction; label: string; icon: string }[] = [
  { value: "dasturlash", label: "Dasturlash", icon: "💻" },
  { value: "dizayn", label: "Dizayn", icon: "🎨" },
  { value: "marketing", label: "Marketing", icon: "📣" },
  { value: "sotuv", label: "Sotuv", icon: "🤝" },
  { value: "data", label: "Data", icon: "📊" },
  { value: "boshqa", label: "Boshqa", icon: "✨" },
];

export const LEVELS: { value: TalentLevel; label: string; icon: string; hint: string }[] = [
  {
    value: "intern",
    label: "Intern",
    icon: "🌱",
    hint: "Endi boshlayapman, o'rganishga tayyorman",
  },
  {
    value: "mutaxassis",
    label: "Mutaxassis",
    icon: "💼",
    hint: "Ish tajribam bor",
  },
];

export const WORK_FORMATS: { value: WorkFormat; label: string; icon: string }[] = [
  { value: "ofis", label: "Ofis", icon: "🏢" },
  { value: "masofaviy", label: "Masofaviy", icon: "🏠" },
  { value: "aralash", label: "Aralash", icon: "🔀" },
];

export const BIRTH_YEAR_MIN = 1985;
export const BIRTH_YEAR_MAX = 2012;

export const MAX_SKILL_TAGS = 6;

export const EXPERIENCE_YEARS_MAX = 30;

/**
 * Wizard steps:
 * 1 fullName · 2 birthYear · 3 city · 4 direction · 5 skillTags · 6 level ·
 * 7 experience (mutaxassis only, auto-skipped for intern) · 8 workFormats ·
 * 9 headline · 10 education · 11 phone · 12 freeText · 13 portfolio.
 */
export const TOTAL_STEPS = 13;

export const EXPERIENCE_STEP = 7;

export const PHONE_REGEX = /^\+998\d{9}$/;
