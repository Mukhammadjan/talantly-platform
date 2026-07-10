const UZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];

function tashkentParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: get("day"),
    month: UZ_MONTHS[Number(get("month")) - 1] ?? "",
    year: get("year"),
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function formatDateUz(iso: string): string {
  const p = tashkentParts(iso);
  return `${p.day}-${p.month} ${p.year}`;
}

export function formatDateTimeUz(iso: string): string {
  const p = tashkentParts(iso);
  return `${p.day}-${p.month}, ${p.time}`;
}
