import type { Direction, Level, RequestStatus, WorkFormat } from "@/lib/types";

export const DIRECTION_LABELS: Record<Direction, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

export const LEVEL_LABELS: Record<Level, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
};

export const WORK_FORMAT_LABELS: Record<WorkFormat, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  yuborildi: "Yuborildi",
  korildi: "Ko'rildi",
  boglanildi: "Bog'lanildi",
  yopildi: "Yopildi",
};

export function formatSalary(from: number | null): string {
  if (from == null) return "Kelishuv asosida";
  return `${from.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
}
