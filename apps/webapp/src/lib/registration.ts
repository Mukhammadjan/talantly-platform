import type { Direction } from "@talantly/shared";

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

export const BIRTH_YEAR_MIN = 1985;
export const BIRTH_YEAR_MAX = 2012;

export const TOTAL_STEPS = 8;

export const PHONE_REGEX = /^\+998\d{9}$/;
