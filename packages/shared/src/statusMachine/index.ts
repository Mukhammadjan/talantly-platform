// Yagona holat mashinasi — BARCHA talant status o'tishlari faqat shu orqali.
// UI/API to'g'ridan-to'g'ri status yozmaydi: nextStatus() dan o'tgan qiymatgina
// setTalentStatus/statusLog bilan saqlanadi.

export type TalantStatus =
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

export type TalantEvent =
  | "profil_toldirildi"
  | "chek_yuborildi"
  | "tolov_tasdiqlandi"
  | "tolov_rad"
  | "cv_tayyor_boldi"
  | "test_otdi"
  | "test_yiqildi_final"
  | "suhbat_band_qilindi"
  | "suhbat_bekor"
  | "suhbat_kelmadi"
  | "tekshirildi"
  | "rad_etildi"
  | "ishga_joylashdi"
  | "boshatildi"
  | "yonalish_ozgardi"
  | "qayta_urinish";

export interface MachineContext {
  /** settings.cv_payment_required — false bo'lsa to'lov bosqichi tashlab ketiladi. */
  cvPaymentRequired?: boolean;
}

type Table = Partial<Record<TalantEvent, Partial<Record<TalantStatus, TalantStatus>>>>;

const T: Table = {
  profil_toldirildi: { yangi: "malumot_toldirilgan" },
  chek_yuborildi: { malumot_toldirilgan: "tolov_kutilmoqda" },
  tolov_tasdiqlandi: { tolov_kutilmoqda: "tolov_tasdiqlangan" },
  tolov_rad: { tolov_kutilmoqda: "malumot_toldirilgan" },
  cv_tayyor_boldi: {
    tolov_tasdiqlangan: "cv_tayyor",
    malumot_toldirilgan: "cv_tayyor", // cv_payment_required=false tarmog'i
  },
  test_otdi: {
    cv_tayyor: "test_otgan",
    tolov_tasdiqlangan: "test_otgan",
    malumot_toldirilgan: "test_otgan",
    rad_etilgan: "test_otgan", // test_past cooldown'dan keyingi muvaffaqiyat
  },
  test_yiqildi_final: {
    cv_tayyor: "rad_etilgan",
    malumot_toldirilgan: "rad_etilgan",
    tolov_tasdiqlangan: "rad_etilgan",
  },
  suhbat_band_qilindi: { test_otgan: "suhbat_belgilangan" },
  suhbat_bekor: { suhbat_belgilangan: "test_otgan" },
  suhbat_kelmadi: { suhbat_belgilangan: "test_otgan" },
  tekshirildi: { suhbat_belgilangan: "tekshirilgan" },
  rad_etildi: { suhbat_belgilangan: "rad_etilgan" },
  ishga_joylashdi: { tekshirilgan: "band" },
  boshatildi: { band: "tekshirilgan" },
  yonalish_ozgardi: { tekshirilgan: "test_otgan", band: "test_otgan" },
  qayta_urinish: { rad_etilgan: "cv_tayyor" },
};

export interface TransitionOk {
  ok: true;
  next: TalantStatus;
}
export interface TransitionErr {
  ok: false;
  error: "invalid_transition";
  current: TalantStatus;
  event: TalantEvent;
}

/** O'tish qoidasi. cv_payment_required=false bo'lsa profil to'lgach to'g'ri cv_tayyor. */
export function nextStatus(
  current: TalantStatus,
  event: TalantEvent,
  ctx: MachineContext = {},
): TransitionOk | TransitionErr {
  if (event === "profil_toldirildi" && current === "yangi" && ctx.cvPaymentRequired === false) {
    return { ok: true, next: "cv_tayyor" };
  }
  const next = T[event]?.[current];
  if (!next) return { ok: false, error: "invalid_transition", current, event };
  return { ok: true, next };
}

/** Feed'ga chiqadigan yagona status. band/is_hidden chiqmaydi. */
export const FEED_VISIBLE_STATUS: TalantStatus = "tekshirilgan";
