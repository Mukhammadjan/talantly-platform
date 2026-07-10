import type {
  Archetype,
  CompanyKind,
  Direction,
  NeededLevel,
  TalentLevel,
  TalentStatus,
  Urgency,
  WorkFormat,
} from "./types.js";

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
  "requests",
  "personality_questions",
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

export const ARCHETYPE_CODES: Archetype[] = [
  "yaratuvchi",
  "tahlilchi",
  "yetakchi",
  "aloqachi",
  "ijrochi",
  "kashfiyotchi",
];

export const ARCHETYPE_META: Record<
  Archetype,
  { label: string; tagline: string; traits: string[]; emoji: string }
> = {
  yaratuvchi: {
    label: "Yaratuvchi",
    tagline: "G'oyalarni jonlantiradigan ijodkor",
    traits: ["Ijodiy fikrlash", "Estetik did", "Yangilikka ochiqlik"],
    emoji: "🎨",
  },
  tahlilchi: {
    label: "Tahlilchi",
    tagline: "Raqamlar tilida gapiradigan mutafakkir",
    traits: ["Mantiqiy fikrlash", "Diqqat bilan ishlash", "Chuqur tahlil"],
    emoji: "📊",
  },
  yetakchi: {
    label: "Yetakchi",
    tagline: "Jamoani maqsad sari boshlaydigan shaxs",
    traits: ["Mas'uliyat", "Qaror qabul qilish", "Jamoani yo'naltirish"],
    emoji: "🚀",
  },
  aloqachi: {
    label: "Aloqachi",
    tagline: "Odamlar bilan tez til topishadigan ko'prik",
    traits: ["Muloqot mahorati", "Empatiya", "Jamoaviy ish"],
    emoji: "🤝",
  },
  ijrochi: {
    label: "Ijrochi",
    tagline: "Ishni oxirigacha yetkazadigan ishonchli qo'l",
    traits: ["Intizom", "Aniqlik", "Muddatga rioya"],
    emoji: "✅",
  },
  kashfiyotchi: {
    label: "Kashfiyotchi",
    tagline: "Yangi yo'llarni birinchi bo'lib sinaydigan izlanuvchi",
    traits: ["Qiziquvchanlik", "Tez o'rganish", "Moslashuvchanlik"],
    emoji: "🧭",
  },
};

export const LEVEL_LABELS_UZ: Record<TalentLevel, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
};

export const WORK_FORMAT_LABELS_UZ: Record<WorkFormat, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

export const SKILL_TAG_BANK: Record<Direction, string[]> = {
  dasturlash: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Django",
    "SQL",
    "PostgreSQL",
    "HTML/CSS",
    "Git",
    "REST API",
    "Telegram bot",
  ],
  dizayn: [
    "Figma",
    "UX/UI",
    "Prototiplash",
    "Dizayn tizimlari",
    "Illustrator",
    "Photoshop",
    "Banner dizayn",
    "Brending",
    "SMM dizayn",
    "Canva",
    "3D",
    "Motion dizayn",
  ],
  marketing: [
    "SMM",
    "Target reklama",
    "Meta Ads",
    "Kontent strategiya",
    "Kontent yozish",
    "Copywriting",
    "Instagram",
    "Telegram kanal",
    "Video montaj",
    "Analitika",
    "Kreativ",
  ],
  sotuv: [
    "B2B sotuv",
    "Muzokara",
    "CRM",
    "Sovuq qo'ng'iroq",
    "Telefon sotuvi",
    "Mijozlar bilan ishlash",
    "Savdo maslahati",
    "Onlayn sotuv",
    "Instagram do'kon",
    "Mijoz xizmati",
  ],
  data: [
    "SQL",
    "Excel",
    "Google Sheets",
    "Power BI",
    "Tableau",
    "Python",
    "Statistika",
    "Data tozalash",
    "Matematika",
    "A/B test",
  ],
  boshqa: [
    "Ofis menejment",
    "Hujjat yuritish",
    "1C",
    "Call-markaz",
    "Mijoz xizmati",
    "Logistika",
    "HR yordamchisi",
    "Muloqot",
    "Ingliz tili",
    "Rus tili",
  ],
};

export const COMPANY_KIND_LABELS_UZ: Record<CompanyKind, string> = {
  kompaniya: "Kompaniya",
  tashkilot: "Tashkilot",
  startup: "Startup",
  shaxsiy: "Shaxsiy",
};

export const NEEDED_LEVEL_LABELS_UZ: Record<NeededLevel, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
  ikkalasi: "Ikkalasi ham",
};

export const URGENCY_LABELS_UZ: Record<Urgency, string> = {
  hoziroq: "Hoziroq kerak",
  oy_ichida: "Oy ichida",
  korib_turibman: "Ko'rib turibman",
};

export const ACTIVITY_TYPES_UZ = [
  "Savdo",
  "IT",
  "Xizmat ko'rsatish",
  "Ishlab chiqarish",
  "Ta'lim",
  "Boshqa",
] as const;

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

