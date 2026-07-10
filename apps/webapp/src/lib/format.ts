const MONTHS_UZ = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
] as const;

const WEEKDAYS_UZ: Record<string, string> = {
  Sun: "Yakshanba",
  Mon: "Dushanba",
  Tue: "Seshanba",
  Wed: "Chorshanba",
  Thu: "Payshanba",
  Fri: "Juma",
  Sat: "Shanba",
};

interface TashkentParts {
  year: number;
  month: number;
  day: number;
  hour: string;
  minute: string;
  weekdayUz: string;
}

export function tashkentParts(iso: string): TashkentParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: get("hour"),
    minute: get("minute"),
    weekdayUz: WEEKDAYS_UZ[get("weekday")] ?? "",
  };
}

export function formatDateUz(iso: string): string {
  const p = tashkentParts(iso);
  return `${p.day}-${MONTHS_UZ[p.month - 1] ?? ""}`;
}

export function formatDateTimeUz(iso: string): string {
  const p = tashkentParts(iso);
  return `${p.weekdayUz}, ${p.day}-${MONTHS_UZ[p.month - 1] ?? ""}, ${p.hour}:${p.minute}`;
}

export function formatTimeUz(iso: string): string {
  const p = tashkentParts(iso);
  return `${p.hour}:${p.minute}`;
}

export function dayKeyTashkent(iso: string): string {
  const p = tashkentParts(iso);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function dayTitleUz(iso: string): string {
  const p = tashkentParts(iso);
  return `${p.weekdayUz}, ${p.day}-${MONTHS_UZ[p.month - 1] ?? ""}`;
}

export function addDaysIso(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
