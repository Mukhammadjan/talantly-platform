import type {
  Archetype,
  CompanyKind,
  CompanyStatus,
  Direction,
  NeededLevel,
  RequestStatus,
  TalentLevel,
  TalentStatus,
  Urgency,
  WorkFormat,
} from "@talantly/shared";

export const STATUS_LABELS: Record<TalentStatus, string> = {
  yangi: "Yangi",
  malumot_toldirilgan: "Ma'lumot to'ldirilgan",
  tolov_kutilmoqda: "To'lov kutilmoqda",
  tolov_tasdiqlangan: "To'lov tasdiqlangan",
  cv_tayyor: "CV tayyor",
  test_otgan: "Test o'tgan",
  suhbat_belgilangan: "Suhbat belgilangan",
  tekshirilgan: "Tekshirilgan",
  rad_etilgan: "Rad etilgan",
};

export const STATUS_ORDER: TalentStatus[] = [
  "yangi",
  "malumot_toldirilgan",
  "tolov_kutilmoqda",
  "tolov_tasdiqlangan",
  "cv_tayyor",
  "test_otgan",
  "suhbat_belgilangan",
  "tekshirilgan",
  "rad_etilgan",
];

export const DIRECTION_LABELS: Record<Direction, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

export const LEVEL_LABELS: Record<TalentLevel, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
};

export const WORK_FORMAT_LABELS: Record<WorkFormat, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  yaratuvchi: "Yaratuvchi",
  tahlilchi: "Tahlilchi",
  yetakchi: "Yetakchi",
  aloqachi: "Aloqachi",
  ijrochi: "Ijrochi",
  kashfiyotchi: "Kashfiyotchi",
};

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  yangi: "Yangi",
  boglanildi: "Bog'lanildi",
  nomzod_yuborildi: "Nomzod yuborildi",
  joylashuv: "Joylashuv",
  tolov_olindi: "To'lov olindi",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  yangi: "Yangi",
  korildi: "Ko'rildi",
  boglanildi: "Bog'lanildi",
  yopildi: "Yopildi",
};

export const URGENCY_LABELS: Record<Urgency, string> = {
  hoziroq: "Hoziroq",
  oy_ichida: "Oy ichida",
  korib_turibman: "Ko'rib turibman",
};

export const COMPANY_KIND_LABELS: Record<CompanyKind, string> = {
  kompaniya: "Kompaniya",
  tashkilot: "Tashkilot",
  startup: "Startup",
  shaxsiy: "Shaxsiy",
};

export const NEEDED_LEVEL_LABELS: Record<NeededLevel, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
  ikkalasi: "Ikkalasi",
};

export const COMPANY_STATUS_ORDER: CompanyStatus[] = [
  "yangi",
  "boglanildi",
  "nomzod_yuborildi",
  "joylashuv",
  "tolov_olindi",
];

export const REQUEST_STATUS_ORDER: RequestStatus[] = [
  "yangi",
  "korildi",
  "boglanildi",
  "yopildi",
];
