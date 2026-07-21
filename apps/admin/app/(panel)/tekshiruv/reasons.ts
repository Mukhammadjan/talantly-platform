// Oddiy modul (server-action EMAS) — client ham, server ham import qiladi.
// "use server" faylдан konstanta eksport qilib bo'lmaydi (faqat async funksiya).

export type RejectReason =
  | "test_yiqildi"
  | "suhbat_yiqildi"
  | "soxta_malumot"
  | "boshqa";

export const REJECT_LABELS: Record<RejectReason, string> = {
  test_yiqildi: "Test yiqildi",
  suhbat_yiqildi: "Suhbat yiqildi",
  soxta_malumot: "Soxta ma'lumot",
  boshqa: "Boshqa",
};
