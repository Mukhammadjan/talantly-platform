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

// ---- Doimiy menyu tugmalari ----
export const MENU = {
  ilova: "📲 Talantly ilovasi",
  holat: "🧭 Holatim",
  profil: "👤 Profilim",
  suhbat: "📅 Suhbat",
  tolov: "💳 To'lov",
  bildirishnoma: "🔔 Bildirishnomalar",
  kanal: "📢 Kanalimiz",
  til: "🌍 Til",
  yordam: "❓ Yordam",
} as const;

export const MENU_HINT = "Quyidagi menyudan kerakli bo'limni tanlang. 👇";

export const ROLE_PROMPT =
  "Kim sifatida davom etasiz?\n\n" +
  "👤 Talant — tekshiruvdan o'ting, tasdiqlangan profil oling va takliflar qabul qiling.\n\n" +
  "💼 Ish beruvchi — tekshirilgan nomzodlarni toping va tez bog'laning.\n\n" +
  "Tanlovingiz saqlanadi — ilova keyingi safar to'g'ri bo'limda ochiladi. ✅";

export const BILDIRISHNOMA_INFO =
  "🔔 Bildirishnomalar\n\n" +
  "Muhim yangiliklarni shu yerga yuboramiz:\n\n" +
  "💳 To'lovingiz tasdiqlanganda\n" +
  "📄 AI CV'ingiz tayyor bo'lganda\n" +
  "📅 Suhbat vaqti yaqinlashganda (1 soat oldin)\n" +
  "✅ Tekshiruvdan o'tganingizda\n" +
  "🏢 Kompaniya siz bilan bog'lanmoqchi bo'lganda\n\n" +
  "Bildirishnomalar yoqilgan — hech narsani o'tkazib yubormaysiz. 👍";

export function kanalText(channelUrl?: string): string {
  if (channelUrl) {
    return (
      "📢 Rasmiy kanalimiz\n\n" +
      "Yangi imkoniyatlar, foydali maslahatlar va e'lonlar:\n" +
      channelUrl
    );
  }
  return "📢 Rasmiy kanalimiz tez orada ochiladi. Kuzatib boring! 🙌";
}

export const TIL_INFO =
  "🌍 Til\n\n" +
  "Hozircha bot o'zbek tilida ishlaydi.\n" +
  "🇷🇺 Rus tili tez orada qo'shiladi.";

// ---- /start banner sarlavhasi ----
export function startCaption(firstName?: string): string {
  const greeting = firstName
    ? `Assalomu alaykum, ${firstName}! 👋`
    : "Assalomu alaykum! 👋";
  return (
    `${greeting}\n\n` +
    "talantly — tajribasiz yoshlarni ishonchli kompaniyalar bilan bog'laydigan platforma.\n\n" +
    "Bir joyda:\n" +
    "🤖 AI yordamida professional CV\n" +
    "🧠 Yo'nalish bo'yicha skill test\n" +
    "🎤 Jonli suhbat va yashil ✅ \"Tekshirilgan\" belgisi\n\n" +
    "Ilova orqali barcha imkoniyatlardan foydalaning yoki quyidagi menyudan boshlang. 👇"
  );
}

// ---- Tekshiruv yo'li (roadmap) ----
const STATUS_RANK: Record<TalentStatus, number> = {
  yangi: 0,
  malumot_toldirilgan: 1,
  tolov_kutilmoqda: 1,
  tolov_tasdiqlangan: 2,
  cv_tayyor: 2,
  test_otgan: 3,
  suhbat_belgilangan: 4,
  tekshirilgan: 5,
  rad_etilgan: 0,
};

const ROADMAP_STAGES = [
  "Ma'lumot to'ldirish",
  "To'lov — AI CV",
  "Testlar",
  "Suhbat",
  "Tekshirilgan ✅",
];

export function statusRank(status: TalentStatus): number {
  return STATUS_RANK[status];
}

export function roadmapText(status: TalentStatus): string {
  const rank = STATUS_RANK[status];
  const lines = ROADMAP_STAGES.map((label, i) => {
    const stage = i + 1;
    const mark = rank >= stage ? "✅" : rank + 1 === stage ? "🟠" : "⚪️";
    return `${mark} ${label}`;
  });
  return lines.join("\n");
}

const NEXT_HINT: Record<TalentStatus, string> = {
  yangi: "Keyingi qadam — ma'lumotlaringizni to'ldiring (ilovada «👤 Profilim»).",
  malumot_toldirilgan: "Keyingi qadam — AI CV uchun to'lov. «💳 To'lov» tugmasini bosing.",
  tolov_kutilmoqda: "To'lovingiz tekshirilmoqda — 24 soat ichida tasdiqlaymiz. ⏳",
  tolov_tasdiqlangan: "AI professional CV'ingiz tayyorlanmoqda. Tez orada yuboramiz. ✨",
  cv_tayyor: "Keyingi qadam — yo'nalishingiz bo'yicha ko'nikma testi (ilovada).",
  test_otgan: "Keyingi qadam — suhbat vaqtini tanlang. «📅 Suhbat» tugmasini bosing.",
  suhbat_belgilangan: "Suhbatingiz belgilangan. Vaqtidan 1 soat oldin eslatma yuboramiz. 📅",
  tekshirilgan: "🎉 Siz tekshirilgansiz! Profilingiz ishonchli kompaniyalarga tavsiya etiladi.",
  rad_etilgan: "Bu safar tasdiqlanmadi. 30 kundan so'ng qayta urinishingiz mumkin. 💪",
};

export function holatText(params: {
  fullName: string | null;
  status: TalentStatus;
}): string {
  const name = params.fullName ? `${params.fullName}, ` : "";
  return (
    `🧭 ${name}holatingiz\n\n` +
    `${STATUS_LABELS[params.status]}\n\n` +
    "Tekshiruv yo'li:\n" +
    `${roadmapText(params.status)}\n\n` +
    `👉 ${NEXT_HINT[params.status]}`
  );
}

// ---- Suhbat band qilish ----
export const SUHBAT_INTRO =
  "📅 Suhbat vaqtini tanlang\n\n" +
  "Sizga qulay kun va vaqtni bosing — moderator bilan qisqa onlayn suhbat belgilanadi:";

export const SUHBAT_EMPTY =
  "Hozircha bo'sh suhbat vaqti yo'q. Tez orada yangi vaqtlar ochiladi — birozdan so'ng qayta urinib ko'ring.";

export function suhbatNotEligible(status: TalentStatus): string {
  return (
    "📅 Suhbat bosqichiga hali yetmadingiz.\n\n" +
    `Joriy holat: ${STATUS_LABELS[status]}\n\n` +
    "Tekshiruv yo'li:\n" +
    `${roadmapText(status)}\n\n` +
    `👉 ${NEXT_HINT[status]}`
  );
}

export function suhbatAlready(scheduledAt: string | null): string {
  const when = scheduledAt ? `\n\n🗓 Vaqt: ${formatDateTimeUz(scheduledAt)}` : "";
  return (
    "📅 Sizda allaqachon belgilangan suhbat bor." +
    when +
    "\n\nVaqtidan 1 soat oldin eslatma yuboramiz. Omad! 🍀"
  );
}

export function suhbatBooked(scheduledAt: string): string {
  return (
    "✅ Suhbat band qilindi!\n\n" +
    `🗓 Vaqt: ${formatDateTimeUz(scheduledAt)}\n\n` +
    "Moderator shu yerda siz bilan bog'lanadi. Vaqtida onlayn bo'ling. Boshlanishidan 1 soat oldin eslatma yuboramiz. 🍀"
  );
}

export const SUHBAT_TAKEN =
  "Afsuski, bu vaqt endigina band bo'ldi. Iltimos, boshqa vaqtni tanlang.";

export function suhbatSlotLabel(iso: string): string {
  return formatDateTimeUz(iso);
}

export function adminNewInterview(params: {
  fullName: string | null;
  scheduledAt: string;
}): string {
  return (
    "🆕 Yangi suhbat band qilindi\n\n" +
    `Nomzod: ${params.fullName ?? "Noma'lum"}\n` +
    `Vaqt: ${formatDateTimeUz(params.scheduledAt)}`
  );
}

// ---- To'lov ----
export function tolovInfo(params: {
  card: string | undefined;
  owner: string | undefined;
  status: TalentStatus;
}): string {
  const lines = [
    "💳 AI professional CV — to'lov",
    "",
    "Narx: 35 000 so'm (bir martalik)",
  ];
  if (params.card) {
    lines.push("", `💳 Karta: ${params.card}`);
    if (params.owner) lines.push(`👤 Egasi: ${params.owner}`);
  }
  lines.push(
    "",
    "1️⃣ Yuqoridagi kartaga 35 000 so'm o'tkazing.",
    "2️⃣ Chek skrinshotini shu yerga rasm qilib yuboring.",
    "3️⃣ Moderator 24 soat ichida tasdiqlaydi.",
  );
  if (!params.card) {
    lines.push(
      "",
      "⚠️ Karta ma'lumoti hozircha sozlanmagan — admin bilan bog'laning (/yordam).",
    );
  }
  return lines.join("\n");
}

export const TOLOV_PHOTO_RECEIVED =
  "✅ Chek qabul qilindi! Moderator 24 soat ichida to'lovni tasdiqlaydi. Natija shu yerga yuboriladi.";

export function adminPaymentScreenshot(params: {
  fullName: string | null;
  tgId: number;
}): string {
  return (
    "🧾 Yangi to'lov cheki\n\n" +
    `Nomzod: ${params.fullName ?? "Noma'lum"}\n` +
    `Telegram ID: ${params.tgId}\n\n` +
    "Tasdiqlash uchun admin panelidan foydalaning."
  );
}

// ---- Admin statistika ----
export function adminStats(counts: {
  total: number;
  yangi?: number;
  malumot_toldirilgan?: number;
  tolov_kutilmoqda?: number;
  test_otgan?: number;
  suhbat_belgilangan?: number;
  tekshirilgan?: number;
  rad_etilgan?: number;
}): string {
  const n = (v?: number): number => v ?? 0;
  return (
    "📊 Talantly statistikasi\n\n" +
    `👥 Jami talantlar: ${counts.total}\n\n` +
    `🆕 Yangi: ${n(counts.yangi)}\n` +
    `📝 Ma'lumot to'ldirilgan: ${n(counts.malumot_toldirilgan)}\n` +
    `⏳ To'lov kutilmoqda: ${n(counts.tolov_kutilmoqda)}\n` +
    `🧠 Testdan o'tgan: ${n(counts.test_otgan)}\n` +
    `📅 Suhbat belgilangan: ${n(counts.suhbat_belgilangan)}\n` +
    `✅ Tekshirilgan: ${n(counts.tekshirilgan)}\n` +
    `❌ Rad etilgan: ${n(counts.rad_etilgan)}\n\n` +
    "Suhbatlarni baholash: /baholash"
  );
}

export const ADMIN_DENIED = "Bu buyruq faqat administrator uchun.";
