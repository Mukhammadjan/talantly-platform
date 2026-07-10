import type { Direction, TalentStatus } from "./types.js";

export const SUPABASE_PROJECT_REF = "fhfrhqhzecdfkahvthgp";

export const STORAGE_BUCKETS = {
  paymentScreenshots: "payment-screenshots",
  cvPdfs: "cv-pdfs",
} as const;

export const PUBLIC_TABLE_NAMES = [
  "users",
  "talents",
  "payments",
  "cv_profiles",
  "skill_tests",
  "test_questions",
  "interviews",
  "interview_slots",
  "companies",
  "placements",
  "status_log",
] as const;

export type PublicTableName = (typeof PUBLIC_TABLE_NAMES)[number];

export const CV_PRICE_UZS = 35000;

export const STATUS_LABELS_UZ: Record<TalentStatus, string> = {
  yangi: "Yangi",
  malumot_toldirilgan: "Ma'lumotlar to'ldirilgan",
  tolov_kutilmoqda: "To'lov kutilmoqda",
  tolov_tasdiqlangan: "To'lov tasdiqlangan",
  cv_tayyor: "CV tayyor",
  test_otgan: "Testdan o'tgan",
  suhbat_belgilangan: "Suhbat belgilangan",
  tekshirilgan: "Tekshirilgan",
  rad_etilgan: "Rad etilgan",
};

export const DIRECTION_LABELS_UZ: Record<Direction, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

export const BRAND_COLORS = {
  cream: "#FBF6F0",
  surface: "#FFFFFF",
  orange: "#F26430",
  orangeDeep: "#F0530A",
  orangeLight: "#FF8A3D",
  green: "#2FB86B",
  greenDeep: "#1F9E58",
  ink: "#191512",
  inkSoft: "#6B625B",
  line: "#EAE2D8",
} as const;

