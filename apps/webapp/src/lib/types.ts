// Frontend tiplari (v2 file-1 — mock). Backend 2-faylda ulanadi.

export type Role = "talant" | "izlovchi";

export type Direction =
  | "dasturlash"
  | "dizayn"
  | "marketing"
  | "sotuv"
  | "data"
  | "boshqa";

export type Level = "intern" | "mutaxassis";

export type WorkFormat = "ofis" | "masofaviy" | "aralash";

export type TalentStatus =
  | "yangi"
  | "malumot_toldirilgan"
  | "tolov_kutilmoqda"
  | "tolov_tasdiqlangan"
  | "cv_tayyor"
  | "test_otgan"
  | "suhbat_belgilangan"
  | "tekshirilgan"
  | "rad_etilgan"
  | "band";

export type RequestStatus = "yuborildi" | "korildi" | "boglanildi" | "yopildi";

export interface TalentProfile {
  fullName: string;
  birthYear: number | null;
  city: string | null;
  district: string | null;
  direction: Direction | null;
  level: Level | null;
  experienceYears: number | null;
  skills: string[];
  workFormats: WorkFormat[];
  salaryFrom: number | null;
  photoUrl: string | null;
  about: string | null;
  portfolioUrl: string | null;
}

export interface TalentSnapshot {
  status: TalentStatus;
  score: number | null;
  archetype: string | null;
  interviewAt: string | null;
  cvReady: boolean;
  profile: TalentProfile;
  /** Rad sababi (A4): test_past | suhbat_yiqildi | soxta_malumot */
  radReason?: string | null;
  /** Profil feed'da yashirinmi (band bo'limi tumbleri) */
  isHidden?: boolean;
  /** To'lov bosqichi kerakmi (settings.cv_payment_required) */
  cvPaymentRequired?: boolean;
  /** AI CV narxi so'mda (settings.cv_price) */
  cvPrice?: number;
}

export interface Application {
  id: string;
  company: string;
  direction: Direction;
  status: RequestStatus;
  at: string;
}

export interface Candidate {
  id: string;
  displayName: string;
  role: string;
  direction: Direction;
  archetype: string;
  score: number;
  district: string;
  level: Level;
  skills: string[];
  about: string;
  salaryFrom: number | null;
  verified: boolean;
  photoUrl: string | null;
  /** Xarita klasteri uchun; null yoki "Boshqa" — xaritaga tushmaydi. */
  city?: string | null;
  age?: number;
  experienceYears?: number;
  isDemo?: boolean;
}

/** Yuborilgan taklif — bitta vakansiya, ko'p nomzodga yuborilgan. */
export type SentStatus = "accepted" | "declined" | "pending";

export interface SentVacancyCandidate {
  cid: string;
  name: string;
  role: string;
  age: number;
  exp: number;
  status: SentStatus;
  verified: boolean;
}

export interface SentVacancy {
  id: string;
  company: string;
  title: string;
  category: string;
  salaryFrom: number;
  salaryTo: number;
  experience: string;
  employment: string;
  date: string;
  district: string;
  candidates: SentVacancyCandidate[];
}

export interface Zone {
  district: string;
  count: number;
  x: number;
  y: number;
}

/** Talant ko'radigan vakansiya (v2 `vacancies` jadvali ko'rinishi). */
export interface Vacancy {
  id: string;
  company: string;
  title: string;
  direction: Direction;
  level: Level | "ikkalasi";
  salaryFrom: number;
  salaryTo: number | null;
  city: string;
  district: string;
  workFormats: WorkFormat[];
  description: string[];
  requirements: string[];
  isDemo?: boolean;
}
