export const DIRECTIONS: { value: string; label: string }[] = [
  { value: "dasturlash", label: "Dasturlash" },
  { value: "dizayn", label: "Dizayn" },
  { value: "marketing", label: "Marketing" },
  { value: "sotuv", label: "Sotuv" },
  { value: "data", label: "Data" },
  { value: "boshqa", label: "Boshqa" },
];

export const DIRECTION_LABEL: Record<string, string> = Object.fromEntries(
  DIRECTIONS.map((d) => [d.value, d.label]),
);

export const LEVELS: { value: string; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "mutaxassis", label: "Mutaxassis" },
];
export const LEVEL_LABEL: Record<string, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
  ikkalasi: "Intern/Mutaxassis",
};

export const SALARY_STEPS: { value: number; label: string }[] = [
  { value: 3000000, label: "3 mln+" },
  { value: 6000000, label: "6 mln+" },
  { value: 9000000, label: "9 mln+" },
];

export const WORK_FORMATS: { value: string; label: string }[] = [
  { value: "ofis", label: "Ofis" },
  { value: "masofaviy", label: "Masofaviy" },
  { value: "aralash", label: "Aralash" },
];

export function formatSalary(from: number | null): string {
  if (from == null) return "Kelishuv asosida";
  return `${from.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
}
