import type {
  Application,
  Candidate,
  TalentSnapshot,
  Zone,
} from "@/lib/types";

// Statik mock — tarmoq YO'Q. O'zbek lotin, "siz".

export const TALENT: TalentSnapshot = {
  status: "malumot_toldirilgan",
  score: null,
  archetype: null,
  interviewAt: null,
  cvReady: false,
  profile: {
    fullName: "Diyor Rahimov",
    birthYear: 2003,
    city: "Toshkent",
    district: "Chilonzor",
    direction: "dasturlash",
    level: "intern",
    experienceYears: null,
    skills: ["JavaScript", "React", "HTML", "CSS"],
    workFormats: ["ofis", "masofaviy"],
    salaryFrom: 4000000,
    photoUrl: null,
    about: "Frontend yo'nalishida o'rganyapman, amaliyotga tayyorman.",
    portfolioUrl: null,
  },
};

export const APPLICATIONS: Application[] = [
  {
    id: "a1",
    company: "Novatech",
    direction: "dasturlash",
    status: "korildi",
    at: "2 kun oldin",
  },
  {
    id: "a2",
    company: "Orient Group",
    direction: "dasturlash",
    status: "yuborildi",
    at: "5 kun oldin",
  },
];

export const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    displayName: "Kamola O.",
    role: "Frontend dasturchi",
    direction: "dasturlash",
    archetype: "Yaratuvchi",
    score: 92,
    district: "Yunusobod",
    level: "mutaxassis",
    skills: ["React", "TypeScript", "Next.js"],
    about: "3 yillik tajriba, mahsulot jamoalarida ishlagan.",
    salaryFrom: 9000000,
    verified: true,
    photoUrl: null,
  },
  {
    id: "c2",
    displayName: "Jasur T.",
    role: "UI/UX dizayner",
    direction: "dizayn",
    archetype: "Kashfiyotchi",
    score: 88,
    district: "Chilonzor",
    level: "mutaxassis",
    skills: ["Figma", "Prototip", "Dizayn tizim"],
    about: "Mobil va veb interfeyslar bo'yicha portfolio.",
    salaryFrom: 8000000,
    verified: true,
    photoUrl: null,
  },
  {
    id: "c3",
    displayName: "Nilufar S.",
    role: "SMM menejer",
    direction: "marketing",
    archetype: "Aloqachi",
    score: 79,
    district: "Mirzo Ulug'bek",
    level: "intern",
    skills: ["Kontent", "Targeting", "Analitika"],
    about: "Ijtimoiy tarmoqlarda kampaniyalar yuritgan.",
    salaryFrom: 4500000,
    verified: true,
    photoUrl: null,
  },
];

export const ZONES: Zone[] = [
  { district: "Chilonzor", count: 12, x: 30, y: 62 },
  { district: "Yunusobod", count: 9, x: 58, y: 28 },
  { district: "Mirzo Ulug'bek", count: 7, x: 74, y: 52 },
  { district: "Yakkasaroy", count: 4, x: 46, y: 74 },
];
