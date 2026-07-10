import {
  DIRECTION_LABELS_UZ,
  type Direction,
  type TalentStatus,
} from "@talantly/shared";

export const REGISTER_BUTTON_LABEL = "📱 Ro'yxatdan o'tish";

export const PROFILE_BUTTON_LABEL = "📱 Profilni ochish";

export const MINI_APP_COMING_SOON = "Mini App tez orada ulanadi.";

export function welcomeIntro(firstName?: string): string {
  const greeting = firstName
    ? `Assalomu alaykum, ${firstName}! 👋`
    : "Assalomu alaykum! 👋";
  return (
    `${greeting}\n\n` +
    "talantly — tajribasiz yoshlarni ishonchli kompaniyalar bilan " +
    "bog'laydigan platforma. Biz sizning iqtidoringizni tekshiramiz va " +
    "tasdiqlaymiz — kompaniyalar esa tekshirilgan talantlarga ishonadi. ✅"
  );
}

export const WELCOME_ROADMAP =
  "Yo'l xaritasi juda oddiy:\n\n" +
  "1️⃣ Ro'yxatdan o'ting\n" +
  "2️⃣ AI yordamida professional CV oling\n" +
  "3️⃣ Skill testdan o'ting\n" +
  "4️⃣ Suhbatdan o'ting va yashil \"Tekshirilgan\" belgisini qo'lga kiriting\n\n" +
  "Boshlashga tayyormisiz?";

export function returningGreeting(params: {
  fullName: string | null;
  firstName?: string;
  status: TalentStatus;
}): string {
  const name = params.fullName ?? params.firstName;
  const greeting = name
    ? `Xush kelibsiz, ${name}! 👋`
    : "Xush kelibsiz! 👋";
  return (
    `${greeting}\n\n` +
    `Holatingiz: ${STATUS_LABELS[params.status]}\n\n` +
    "Profilingizni ochib, keyingi qadamni davom ettiring."
  );
}

export function deepLinkGreeting(fullName: string): string {
  return (
    `Assalomu alaykum, ${fullName}! 👋\n\n` +
    "Saytdagi arizangizni oldik — endi ro'yxatdan o'tishni shu yerda " +
    "davom ettiramiz. Quyidagi tugma orqali boshlashingiz mumkin."
  );
}

export const STATUS_LABELS: Record<TalentStatus, string> = {
  yangi: "🆕 Yangi — ro'yxatdan o'tish boshlanmagan",
  malumot_toldirilgan: "📝 Ma'lumotlar to'ldirilgan",
  tolov_kutilmoqda: "⏳ To'lov kutilmoqda",
  tolov_tasdiqlangan: "💳 To'lov tasdiqlangan",
  cv_tayyor: "📄 CV tayyor",
  test_otgan: "🧠 Testdan o'tgan",
  suhbat_belgilangan: "📅 Suhbat belgilangan",
  tekshirilgan: "✅ Tekshirilgan",
  rad_etilgan: "❌ Rad etilgan",
};

export const DIRECTION_LABELS: Record<Direction, string> = DIRECTION_LABELS_UZ;

export const PROFILE_NOT_REGISTERED = "Siz hali ro'yxatdan o'tmagansiz.";

export const PROFILE_REGISTER_HINT =
  "Ro'yxatdan o'tish uchun quyidagi tugmani bosing.";

export function profileSummary(params: {
  fullName: string | null;
  direction: Direction | null;
  status: TalentStatus;
}): string {
  const name = params.fullName ?? "Ism hali kiritilmagan";
  const direction = params.direction
    ? DIRECTION_LABELS[params.direction]
    : "Tanlanmagan";
  return (
    "👤 Sizning profilingiz\n\n" +
    `Ism: ${name}\n` +
    `Yo'nalish: ${direction}\n` +
    `Holat: ${STATUS_LABELS[params.status]}`
  );
}

export function helpText(adminUsername?: string): string {
  const contactLines = ["📞 Telefon: +998 99-030-73-22"];
  if (adminUsername) {
    contactLines.push(`✍️ Telegram: @${adminUsername.replace(/^@/, "")}`);
  }
  return (
    "❓ Ko'p so'raladigan savollar\n\n" +
    "1. talantly qanday ishlaydi?\n" +
    "Siz ro'yxatdan o'tasiz, AI CV olasiz, skill test va suhbatdan " +
    "o'tasiz. Tekshiruvdan o'tgan talantlarni biz ishonchli " +
    "kompaniyalarga tavsiya qilamiz.\n\n" +
    "2. AI CV qancha turadi?\n" +
    "35 000 so'm — bir martalik to'lov. Karta orqali o'tkazasiz, chek " +
    "skrinshotini botga yuborasiz, moderator 24 soat ichida tasdiqlaydi.\n\n" +
    "3. Tekshiruv qancha vaqt oladi?\n" +
    "Odatda 2-4 kun: CV tayyorlanadi, testdan o'tasiz va qulay vaqtda " +
    "onlayn suhbat belgilanadi.\n\n" +
    "Boshqa savol bo'lsa, biz bilan bog'laning:\n" +
    contactLines.join("\n")
  );
}

export function formatDateTimeUz(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
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
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  const monthIdx = Number(get("month")) - 1;
  return `${get("day")}-${months[monthIdx] ?? ""}, soat ${get("hour")}:${get("minute")}`;
}

export const BAHOLASH_DENIED =
  "Bu buyruq faqat moderatorlar uchun mo'ljallangan.";

export const BAHOLASH_EMPTY =
  "Hozircha baholanadigan suhbatlar yo'q. Yangi suhbat belgilanganida shu yerda ko'rasiz.";

export const BAHOLASH_LIST_HEADER =
  "📋 Baholanadigan suhbatlar\n\nNomzodni tanlang:";

export function baholashCandidateCard(params: {
  fullName: string | null;
  direction: Direction | null;
  score: number | null;
  scheduledAt: string | null;
}): string {
  const lines = [
    "👤 Nomzod haqida",
    "",
    `Ism: ${params.fullName ?? "Noma'lum"}`,
    `Yo'nalish: ${params.direction ? DIRECTION_LABELS[params.direction] : "Tanlanmagan"}`,
    `Skill test: ${params.score !== null ? `${params.score}/100` : "—"}`,
  ];
  if (params.scheduledAt) {
    lines.push(`Suhbat vaqti: ${formatDateTimeUz(params.scheduledAt)}`);
  }
  lines.push("", "Suhbatni 1 dan 5 gacha baholang:");
  return lines.join("\n");
}

export const BAHOLASH_NOTES_PROMPT =
  "✍️ Suhbat haqida qisqacha izoh yozib yuboring yoki o'tkazib yuboring.";

export function baholashConfirmPrompt(params: {
  fullName: string | null;
  rating: number;
  notes: string | null;
}): string {
  return (
    "Yakuniy qaror:\n\n" +
    `Nomzod: ${params.fullName ?? "Noma'lum"}\n` +
    `Baho: ${"⭐".repeat(params.rating)} (${params.rating}/5)\n` +
    `Izoh: ${params.notes ?? "—"}\n\n` +
    "Nomzodni tasdiqlaysizmi?"
  );
}

export function baholashDoneModerator(params: {
  fullName: string | null;
  approved: boolean;
}): string {
  return params.approved
    ? `✅ ${params.fullName ?? "Nomzod"} tasdiqlandi va "Tekshirilgan" maqomini oldi.`
    : `❌ ${params.fullName ?? "Nomzod"} rad etildi. Nomzodga xabar yuborildi.`;
}

export const BAHOLASH_EXPIRED =
  "Bu suhbat allaqachon baholangan yoki topilmadi.";

export function verifiedCongrats(fullName: string | null): string {
  const name = fullName ? `${fullName}, tabriklaymiz` : "Tabriklaymiz";
  return (
    `🎉 ${name}!\n\n` +
    "Siz tekshiruvning barcha bosqichlaridan muvaffaqiyatli o'tdingiz va " +
    "yashil \"Tekshirilgan\" ✅ belgisini qo'lga kiritdingiz!\n\n" +
    "Sovg'a sifatida AI professional CV'ingizni tayyorlayapti — " +
    "bir necha daqiqada shu yerga yuboramiz.\n\n" +
    "Endi profilingiz ishonchli kompaniyalarga tavsiya etiladi. Mos " +
    "amaliyot topilishi bilan siz bilan bog'lanamiz. Omad! 🍀"
  );
}

export function rejectedMessage(fullName: string | null): string {
  const name = fullName ? `${fullName}, hurmatli` : "Hurmatli";
  return (
    `${name} nomzod!\n\n` +
    "Afsuski, bu safar suhbat natijasi bo'yicha profilingizni tasdiqlay " +
    "olmadik. Bu — yakuniy hukm emas: tajriba orttirib, 30 kundan so'ng " +
    "qayta urinishingiz mumkin.\n\n" +
    "Shu vaqt ichida bilimlaringizni mustahkamlashni tavsiya qilamiz. " +
    "Sizga omad tilaymiz! 💪"
  );
}

export function interviewReminder(scheduledAt: string): string {
  return (
    "⏰ Eslatma!\n\n" +
    `Suhbatingiz taxminan 1 soatdan so'ng — ${formatDateTimeUz(scheduledAt)} da boshlanadi.\n\n` +
    "Moderator siz bilan shu yerda bog'lanadi. Iltimos, vaqtida onlayn bo'ling. Omad! 🍀"
  );
}

export function cvReadyMessage(
  fullName: string | null,
  verified = false,
): string {
  const name = fullName ? `${fullName}, tabriklaymiz` : "Tabriklaymiz";
  const nextStep = verified
    ? "Bu — tekshiruvdan o'tganingiz uchun sovg'amiz. Endi profilingiz " +
      "ishonchli kompaniyalarga tavsiya etiladi! 🏆"
    : "Keyingi qadam — yo'nalishingiz bo'yicha qisqa skill test. " +
      "Profilingizni ochib, testni boshlang! 🚀";
  return (
    `🎉 ${name}! Professional CV'ingiz tayyor.\n\n` +
    "AI sizning ma'lumotlaringizni tahlil qilib, kuchli tomonlaringizni " +
    "ajratib berdi — CV faylini yuqorida ko'rishingiz mumkin.\n\n" +
    nextStep
  );
}

export const GENERIC_ERROR =
  "Kechirasiz, texnik xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.";
