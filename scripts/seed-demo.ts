/**
 * Stage 2 demo seed for talantly.
 *
 * Idempotent: every demo row has a deterministic UUID derived from a stable
 * seed key, and everything is written with upsert-on-id. Re-running updates
 * the same rows instead of duplicating them. Real rows (is_demo=false) are
 * never touched: the script only writes rows whose ids belong to its own
 * deterministic namespace and never deletes anything.
 *
 * Run: npm run seed:demo
 */
import { createHash } from "node:crypto";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import {
  createServiceClient,
  type Archetype,
  type CompanyInsert,
  type CvExperienceItem,
  type CvProfileInsert,
  type Direction,
  type InterviewInsert,
  type PersonalityQuestionInsert,
  type PersonalityResult,
  type RequestInsert,
  type SkillTestInsert,
  type StatusLogInsert,
  type TalantlyClient,
  type TalentInsert,
  type TalentLevel,
  type TalentStatus,
  type TestQuestionInsert,
  type WorkFormat,
} from "@talantly/shared";

// Run from the repo root (npm run seed:demo) so .env resolves.
loadEnv({ path: path.join(process.cwd(), ".env") });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name} (repo root .env)`);
  return value;
}

/** Deterministic UUID from a stable seed key (sha1, v4/variant bits forced). */
function demoId(key: string): string {
  const h = createHash("sha1")
    .update(`talantly-demo-seed-v1:${key}`)
    .digest("hex");
  const variantNibble = ((parseInt(h.charAt(16), 16) & 0x3) | 0x8).toString(16);
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    `4${h.slice(13, 16)}`,
    `${variantNibble}${h.slice(17, 20)}`,
    h.slice(20, 32),
  ].join("-");
}

/** ISO timestamp N days before the (fixed) seed reference date. */
const SEED_NOW = Date.parse("2026-07-10T09:00:00.000Z");
function daysAgo(days: number, hour = 10): string {
  const d = new Date(SEED_NOW - days * 86_400_000);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Archetypes
// ---------------------------------------------------------------------------

const ARCHETYPES: Record<
  Archetype,
  { label: string; tagline: string; traits: string[] }
> = {
  yaratuvchi: {
    label: "Yaratuvchi",
    tagline: "G'oyalarni jonlantiradigan ijodkor",
    traits: ["Ijodiy fikrlash", "Estetik did", "Yangilikka ochiqlik"],
  },
  tahlilchi: {
    label: "Tahlilchi",
    tagline: "Raqamlar tilida gapiradigan mutafakkir",
    traits: ["Mantiqiy fikrlash", "Diqqat bilan ishlash", "Chuqur tahlil"],
  },
  yetakchi: {
    label: "Yetakchi",
    tagline: "Jamoani maqsad sari boshlaydigan shaxs",
    traits: ["Mas'uliyat", "Qaror qabul qilish", "Jamoani yo'naltirish"],
  },
  aloqachi: {
    label: "Aloqachi",
    tagline: "Odamlar bilan tez til topishadigan ko'prik",
    traits: ["Muloqot mahorati", "Empatiya", "Jamoaviy ish"],
  },
  ijrochi: {
    label: "Ijrochi",
    tagline: "Ishni oxirigacha yetkazadigan ishonchli qo'l",
    traits: ["Intizom", "Aniqlik", "Muddatga rioya"],
  },
  kashfiyotchi: {
    label: "Kashfiyotchi",
    tagline: "Yangi yo'llarni birinchi bo'lib sinaydigan izlanuvchi",
    traits: ["Qiziquvchanlik", "Tez o'rganish", "Moslashuvchanlik"],
  },
};

// ---------------------------------------------------------------------------
// 1a. Personality question bank — 15 active questions.
// The first three keep the ids of the rows already in the cloud so the
// existing sample rows are updated in place instead of duplicated.
// Q4 and Q13 are the consistency-check pair (same dimension, reworded).
// ---------------------------------------------------------------------------

const PERSONALITY_QUESTIONS: PersonalityQuestionInsert[] = [
  {
    id: "c22f552a-b7d8-491f-8efa-9311d4baf436",
    ord: 1,
    is_active: true,
    question: "Yangi loyiha boshlaganda sizni nima ko'proq qiziqtiradi?",
    options: [
      {
        label: "Yangi g'oyalar o'ylab topish",
        weights: { yaratuvchi: 1, kashfiyotchi: 2 },
      },
      { label: "Aniq reja tuzish", weights: { ijrochi: 1, tahlilchi: 2 } },
      {
        label: "Jamoani yig'ish va yo'naltirish",
        weights: { aloqachi: 1, yetakchi: 2 },
      },
      { label: "Darhol ishga kirishish", weights: { ijrochi: 2 } },
    ],
  },
  {
    id: "e5ef7fc0-ecd1-4c06-bc9c-9c85f6d9daf9",
    ord: 2,
    is_active: true,
    question: "Jamoada odatda qanday rol o'ynaysiz?",
    options: [
      { label: "G'oya beruvchi", weights: { yaratuvchi: 2, kashfiyotchi: 1 } },
      { label: "Tartibga soluvchi", weights: { tahlilchi: 2 } },
      { label: "Odamlarni bog'lovchi", weights: { aloqachi: 2 } },
      {
        label: "Ishni oxiriga yetkazuvchi",
        weights: { ijrochi: 2, yetakchi: 1 },
      },
    ],
  },
  {
    id: "97b8c0bb-d1bf-401c-b062-252bc9b2c6a7",
    ord: 3,
    is_active: true,
    question: "Qiyin vaziyatda birinchi nima qilasiz?",
    options: [
      {
        label: "Muammoni qismlarga bo'lib tahlil qilaman",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Boshqalardan yordam va fikr so'rayman",
        weights: { aloqachi: 2 },
      },
      { label: "Tez qaror qabul qilaman", weights: { ijrochi: 1, yetakchi: 2 } },
      {
        label: "Yangi yondashuv qidiraman",
        weights: { yaratuvchi: 1, kashfiyotchi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:4"),
    ord: 4,
    is_active: true,
    question: "Ish kuningiz qanday o'tsa, o'zingizni baxtli his qilasiz?",
    options: [
      {
        label: "Yangi g'oya yoki dizayn ustida ishlasam",
        weights: { yaratuvchi: 2, kashfiyotchi: 1 },
      },
      {
        label: "Raqamlar va faktlar bilan ishlasam",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Kun bo'yi odamlar bilan muloqotda bo'lsam",
        weights: { aloqachi: 2, yetakchi: 1 },
      },
      {
        label: "Reja bo'yicha hamma ishni bajarsam",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:5"),
    ord: 5,
    is_active: true,
    question: "Guruh topshirig'ida qaysi qism sizga ko'proq yoqadi?",
    options: [
      {
        label: "G'oya o'ylab topish bosqichi",
        weights: { yaratuvchi: 2, kashfiyotchi: 1 },
      },
      {
        label: "Vazifalarni taqsimlash va jarayonni boshqarish",
        weights: { yetakchi: 2, tahlilchi: 1 },
      },
      {
        label: "Natijani taqdim qilish va himoya qilish",
        weights: { aloqachi: 2 },
      },
      {
        label: "Ishni sifatli qilib yakunlash",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:6"),
    ord: 6,
    is_active: true,
    question: "Yangi bilimni qanday o'rganishni afzal ko'rasiz?",
    options: [
      {
        label: "O'zim tajriba qilib, sinab ko'rib",
        weights: { kashfiyotchi: 2, yaratuvchi: 1 },
      },
      {
        label: "Chuqur o'qib, konspekt qilib",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Biladigan odamlardan so'rab, muhokama qilib",
        weights: { aloqachi: 2 },
      },
      {
        label: "Amaliy mashqlarni qayta-qayta bajarib",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:7"),
    ord: 7,
    is_active: true,
    question: "Xato qilganingizda odatda nima qilasiz?",
    options: [
      {
        label: "Xatoning sababini sinchiklab tahlil qilaman",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Muammoga butunlay yangi yo'l izlayman",
        weights: { kashfiyotchi: 2, yaratuvchi: 1 },
      },
      {
        label: "Mas'uliyatni bo'ynimga olib, jamoani tinchlantiraman",
        weights: { yetakchi: 2, aloqachi: 1 },
      },
      {
        label: "Darhol tuzatishga kirishaman",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:8"),
    ord: 8,
    is_active: true,
    question: "Sizga qaysi ta'rif ko'proq mos keladi?",
    options: [
      { label: "Tasavvuri boy va ijodkor", weights: { yaratuvchi: 2 } },
      { label: "Mantiqiy va sinchkov", weights: { tahlilchi: 2 } },
      {
        label: "Ishonchli tashkilotchi",
        weights: { yetakchi: 2, ijrochi: 1 },
      },
      { label: "Ochiq va samimiy suhbatdosh", weights: { aloqachi: 2 } },
    ],
  },
  {
    id: demoId("pq:9"),
    ord: 9,
    is_active: true,
    question: "Bo'sh vaqtingizda nima qilishni yoqtirasiz?",
    options: [
      {
        label: "Rasm, dizayn yoki musiqa bilan shug'ullanish",
        weights: { yaratuvchi: 2 },
      },
      {
        label: "Boshqotirma, shaxmat yoki qiziqarli statistika",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Do'stlar bilan uchrashish va suhbatlashish",
        weights: { aloqachi: 2 },
      },
      {
        label: "Yangi joylar va yangi mashg'ulotlarni sinash",
        weights: { kashfiyotchi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:10"),
    ord: 10,
    is_active: true,
    question: "Muddat (deadline) yaqinlashganda o'zingizni qanday tutasiz?",
    options: [
      {
        label: "Bosim ostida eng yaxshi g'oyalarim keladi",
        weights: { yaratuvchi: 2, kashfiyotchi: 1 },
      },
      {
        label: "Rejani qayta hisoblab, ustuvorliklarni aniqlayman",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Jamoani safarbar qilib, vazifalarni bo'laman",
        weights: { yetakchi: 2 },
      },
      {
        label: "Boshimni ko'tarmay ishlab, vaqtida topshiraman",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:11"),
    ord: 11,
    is_active: true,
    question: "Qaysi maqtov sizga ko'proq yoqadi?",
    options: [
      { label: "“G'oyang juda zo'r ekan!”", weights: { yaratuvchi: 2 } },
      {
        label: "“Xulosalaring aniq va asosli ekan”",
        weights: { tahlilchi: 2 },
      },
      {
        label: "“Sen bilan ishlash juda oson”",
        weights: { aloqachi: 2 },
      },
      {
        label: "“Ishni vaqtida va sifatli qilding”",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:12"),
    ord: 12,
    is_active: true,
    question: "10 yildan keyin o'zingizni qayerda ko'rasiz?",
    options: [
      {
        label: "O'z studiyam yoki brendim bilan",
        weights: { yaratuvchi: 2, kashfiyotchi: 1 },
      },
      {
        label: "Yirik kompaniyada tan olingan ekspert sifatida",
        weights: { tahlilchi: 2, ijrochi: 1 },
      },
      {
        label: "O'z jamoamga rahbar bo'lib",
        weights: { yetakchi: 2, aloqachi: 1 },
      },
      {
        label: "Har doim yangi soha va loyihalarni sinab yuraman",
        weights: { kashfiyotchi: 2 },
      },
    ],
  },
  {
    // Consistency-check pair with ord 4: same dimension, reworded.
    id: demoId("pq:13"),
    ord: 13,
    is_active: true,
    question: "Qaysi turdagi ish sizga ko'proq kuch-quvvat beradi?",
    options: [
      {
        label: "Yo'q narsadan yangi narsa yaratish",
        weights: { yaratuvchi: 2, kashfiyotchi: 1 },
      },
      {
        label: "Ma'lumotlarni tartibga solish va tahlil qilish",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Odamlar bilan gaplashish va kelishish",
        weights: { aloqachi: 2, yetakchi: 1 },
      },
      {
        label: "Belgilangan ishni aniq va toza bajarish",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:14"),
    ord: 14,
    is_active: true,
    question: "Jamoada kelishmovchilik chiqsa, qanday yo'l tutasiz?",
    options: [
      {
        label: "Ikkala tomonni tinglab, murosaga keltiraman",
        weights: { aloqachi: 2 },
      },
      {
        label: "Faktlar va dalillarga qarab xulosa chiqaraman",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Qaror qabul qilib, jamoaga yo'nalish beraman",
        weights: { yetakchi: 2 },
      },
      {
        label: "Bahsni to'xtatib, ishni davom ettirishga chaqiraman",
        weights: { ijrochi: 2 },
      },
    ],
  },
  {
    id: demoId("pq:15"),
    ord: 15,
    is_active: true,
    question: "Kutilmagan yangi imkoniyat paydo bo'lsa, nima qilasiz?",
    options: [
      {
        label: "Darhol sinab ko'raman — keyin o'ylayman",
        weights: { kashfiyotchi: 2, yaratuvchi: 1 },
      },
      {
        label: "Avval risk va foydasini o'lchab chiqaman",
        weights: { tahlilchi: 2 },
      },
      {
        label: "Jamoam va yaqinlarim bilan maslahatlashaman",
        weights: { aloqachi: 2, yetakchi: 1 },
      },
      {
        label: "Hozirgi ishimni tugatib, keyin qarayman",
        weights: { ijrochi: 2 },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 1b. Skill-test question banks — 10 per direction (dasturlash already has 10
// in the cloud and is left untouched).
// ---------------------------------------------------------------------------

type QuestionSpec = { q: string; o: [string, string, string, string]; c: number };

function toTestQuestions(
  direction: Direction,
  specs: QuestionSpec[],
): TestQuestionInsert[] {
  return specs.map((s, i) => ({
    id: demoId(`tq:${direction}:${i + 1}`),
    direction,
    question: s.q,
    options: s.o,
    correct_index: s.c,
    is_active: true,
  }));
}

const TEST_QUESTIONS: TestQuestionInsert[] = [
  ...toTestQuestions("dizayn", [
    {
      q: "UX va UI dizayn o'rtasidagi asosiy farq nimada?",
      o: [
        "UX — foydalanuvchi tajribasi, UI — vizual interfeys",
        "UX — ranglar, UI — shriftlar",
        "Ikkalasi bir xil tushuncha",
        "UX faqat mobil ilovalarga tegishli",
      ],
      c: 0,
    },
    {
      q: "Qaysi rang juftligi komplementar (qarama-qarshi) hisoblanadi?",
      o: [
        "Ko'k va yashil",
        "To'q sariq va ko'k",
        "Qizil va pushti",
        "Sariq va oq",
      ],
      c: 1,
    },
    {
      q: "Vizual ierarxiya nimani anglatadi?",
      o: [
        "Rasmlarni katta qilib qo'yish",
        "Elementlarni muhimlik darajasiga qarab joylashtirish",
        "Faqat bitta shrift ishlatish",
        "Sahifani simmetrik qilish",
      ],
      c: 1,
    },
    {
      q: "Figma'da \"Component\" nima uchun ishlatiladi?",
      o: [
        "Faylni saqlash uchun",
        "Rangni tanlash uchun",
        "Qayta ishlatiladigan elementlar yaratish uchun",
        "Rasmni kesish uchun",
      ],
      c: 2,
    },
    {
      q: "Sans-serif shriftga misol qaysi?",
      o: ["Times New Roman", "Georgia", "Inter", "Garamond"],
      c: 2,
    },
    {
      q: "Vektor grafika rastr grafikadan nimasi bilan farq qiladi?",
      o: [
        "Vektor kattalashtirilganda sifatini yo'qotmaydi",
        "Vektor faqat qora-oq bo'ladi",
        "Rastr har doim kichikroq hajmda bo'ladi",
        "Farqi yo'q",
      ],
      c: 0,
    },
    {
      q: "Oq bo'shliq (whitespace) dizaynda nima vazifani bajaradi?",
      o: [
        "Joyni behuda sarflaydi",
        "Kontentga \"nafas\" berib, o'qishni osonlashtiradi",
        "Faqat minimalizm uchun kerak",
        "Sahifani bo'sh ko'rsatadi",
      ],
      c: 1,
    },
    {
      q: "Mobil interfeysda tugma uchun qulay minimal o'lcham qancha?",
      o: ["Taxminan 8x8 px", "Taxminan 16x16 px", "Taxminan 44x44 px", "Taxminan 100x100 px"],
      c: 2,
    },
    {
      q: "Kontrast dizaynda nima uchun muhim?",
      o: [
        "Matnni o'qish osonligi va e'tiborni boshqarish uchun",
        "Faqat chiroyli ko'rinishi uchun",
        "Bosib chiqarishda kerak bo'lgani uchun",
        "Muhim emas",
      ],
      c: 0,
    },
    {
      q: "Grid (to'r) tizimi nimaga xizmat qiladi?",
      o: [
        "Elementlarni tartibli va bir tekis joylashtirishga",
        "Ranglarni aralashtirishga",
        "Animatsiya yaratishga",
        "Fayl hajmini kichraytirishga",
      ],
      c: 0,
    },
  ]),
  ...toTestQuestions("marketing", [
    {
      q: "Marketingdagi \"4P\" nimalardan iborat?",
      o: [
        "Plan, People, Process, Profit",
        "Product, Price, Place, Promotion",
        "Post, Page, Public, Press",
        "Project, Program, Portfolio, PR",
      ],
      c: 1,
    },
    {
      q: "Maqsadli auditoriya (target audience) nima?",
      o: [
        "Barcha internet foydalanuvchilari",
        "Mahsulot mo'ljallangan aniq odamlar guruhi",
        "Kompaniya xodimlari",
        "Raqobatchilarning mijozlari",
      ],
      c: 1,
    },
    {
      q: "CTR (Click-Through Rate) qanday hisoblanadi?",
      o: [
        "Bosishlar soni / ko'rsatishlar soni x 100%",
        "Sotuvlar / xarajatlar",
        "Obunachilar / postlar soni",
        "Layklar + kommentlar",
      ],
      c: 0,
    },
    {
      q: "AIDA modeli qaysi bosqichlardan iborat?",
      o: [
        "Analyze, Invest, Deliver, Assess",
        "Attention, Interest, Desire, Action",
        "Ask, Inform, Discuss, Agree",
        "Aim, Idea, Design, Approve",
      ],
      c: 1,
    },
    {
      q: "Organik va pullik trafik o'rtasidagi farq nimada?",
      o: [
        "Organik — reklama orqali, pullik — qidiruvdan",
        "Organik — tabiiy ravishda keladi, pullik — reklama evaziga",
        "Ikkalasi bir xil",
        "Pullik trafik har doim sifatliroq",
      ],
      c: 1,
    },
    {
      q: "CTA (Call to Action) nima?",
      o: [
        "Mijozlar bazasi",
        "Reklama byudjeti",
        "Foydalanuvchini harakatga undovchi chaqiriq",
        "Kontent rejasi",
      ],
      c: 2,
    },
    {
      q: "A/B test nima uchun o'tkaziladi?",
      o: [
        "Ikki variantdan qaysi biri yaxshiroq ishlashini aniqlash uchun",
        "Byudjetni ikkiga bo'lish uchun",
        "Ikki xil mahsulot sotish uchun",
        "Auditoriyani ikkiga ajratib tashlash uchun",
      ],
      c: 0,
    },
    {
      q: "Auditoriya segmentatsiyasi nima?",
      o: [
        "Barcha mijozlarga bir xil xabar yuborish",
        "Auditoriyani o'xshash belgilar bo'yicha guruhlarga bo'lish",
        "Obunachilarni o'chirish",
        "Reklamani to'xtatish",
      ],
      c: 1,
    },
    {
      q: "SMM nimani anglatadi?",
      o: [
        "Ijtimoiy tarmoqlar marketingi",
        "Sotuv menejmenti modeli",
        "Saytlarni moslashtirish metodi",
        "Statistika va matematik model",
      ],
      c: 0,
    },
    {
      q: "Marketing voronkasi (funnel) nimani ko'rsatadi?",
      o: [
        "Kompaniya tashkiliy tuzilmasini",
        "Mijozning tanishuvdan xaridgacha bo'lgan yo'lini",
        "Reklama narxlarini",
        "Mahsulot ishlab chiqarish jarayonini",
      ],
      c: 1,
    },
  ]),
  ...toTestQuestions("sotuv", [
    {
      q: "Sotuvda \"lead\" (lid) nima?",
      o: [
        "Mahsulotga qiziqish bildirgan potensial mijoz",
        "Sotuv bo'limi rahbari",
        "Chegirma turi",
        "Yetkazib berish xizmati",
      ],
      c: 0,
    },
    {
      q: "Mijoz \"qimmat ekan\" desa, eng to'g'ri javob qaysi?",
      o: [
        "Darhol chegirma berish",
        "Mahsulot qiymatini va foydasini tushuntirish",
        "Suhbatni tugatish",
        "Raqobatchiga yuborish",
      ],
      c: 1,
    },
    {
      q: "CRM tizimi nima uchun kerak?",
      o: [
        "Xodimlar maoshini hisoblash uchun",
        "Mijozlar bilan munosabatlarni tartibli yuritish uchun",
        "Sayt yaratish uchun",
        "Mahsulot ishlab chiqarish uchun",
      ],
      c: 1,
    },
    {
      q: "Cross-sell nima?",
      o: [
        "Mijozga asosiy xaridiga qo'shimcha mahsulot taklif qilish",
        "Narxni pasaytirish",
        "Mijozni raqobatchidan tortib olish",
        "Onlayn sotuv turi",
      ],
      c: 0,
    },
    {
      q: "Sovuq qo'ng'iroq (cold call) nima?",
      o: [
        "Kechqurun qilingan qo'ng'iroq",
        "Oldindan tanish bo'lmagan potensial mijozga qo'ng'iroq",
        "Doimiy mijozga qo'ng'iroq",
        "Ish bo'yicha ichki qo'ng'iroq",
      ],
      c: 1,
    },
    {
      q: "Sotuvchining eng muhim ko'nikmasi qaysi?",
      o: [
        "Tez gapirish",
        "Mijozni diqqat bilan tinglash",
        "Ko'p va'da berish",
        "Har doim arzon narx taklif qilish",
      ],
      c: 1,
    },
    {
      q: "Konversiya darajasi nimani bildiradi?",
      o: [
        "Xaridorga aylangan potensial mijozlar ulushini",
        "Do'kondagi mahsulotlar sonini",
        "Sotuvchining ish soatini",
        "Valyuta kursini",
      ],
      c: 0,
    },
    {
      q: "Follow-up (kuzatuv aloqasi) nima uchun muhim?",
      o: [
        "Mijozni bezovta qilish uchun",
        "Qaror qabul qilish jarayonida mijoz bilan aloqani saqlash uchun",
        "Rahbarga hisobot berish uchun",
        "Muhim emas",
      ],
      c: 1,
    },
    {
      q: "Mijoz ehtiyojini aniqlashning eng yaxshi usuli qaysi?",
      o: [
        "Ochiq savollar berish va tinglash",
        "Darhol mahsulotni maqtash",
        "Narxni aytish",
        "Katalog yuborish",
      ],
      c: 0,
    },
    {
      q: "Bitimni yopish (closing) bosqichida nima qilinadi?",
      o: [
        "Mahsulot bilan birinchi tanishtirish",
        "Mijozni xaridga yakuniy qaror qabul qilishga olib kelish",
        "Reklama joylash",
        "Yangi mijozlar qidirish",
      ],
      c: 1,
    },
  ]),
  ...toTestQuestions("data", [
    {
      q: "O'rtacha qiymat (mean) va mediana qanday farq qiladi?",
      o: [
        "Ikkalasi ham bir xil",
        "Mediana — saralangan qatordagi o'rta qiymat, mean — yig'indi/soni",
        "Mean har doim katta bo'ladi",
        "Mediana faqat toq sonlar uchun",
      ],
      c: 1,
    },
    {
      q: "SQL'da jadvaldan ma'lumot o'qish uchun qaysi buyruq ishlatiladi?",
      o: ["INSERT", "UPDATE", "SELECT", "DELETE"],
      c: 2,
    },
    {
      q: "Korrelyatsiya sababiyatni (causation) anglatadimi?",
      o: [
        "Ha, har doim",
        "Yo'q — ikki ko'rsatkich bog'liq bo'lsa ham, biri ikkinchisining sababi bo'lmasligi mumkin",
        "Faqat katta ma'lumotlarda",
        "Korrelyatsiya va sababiyat bir xil tushuncha",
      ],
      c: 1,
    },
    {
      q: "Vaqt bo'yicha o'zgarishni ko'rsatish uchun qaysi diagramma eng mos?",
      o: ["Doira (pie) diagramma", "Chiziqli (line) grafik", "Jadval", "Xarita"],
      c: 1,
    },
    {
      q: "Ma'lumotlarni tozalash (data cleaning) nimani o'z ichiga oladi?",
      o: [
        "Bo'sh, takroriy va xato qiymatlarni aniqlash va tuzatish",
        "Ma'lumotlarni o'chirib tashlash",
        "Faylni siqish",
        "Parol qo'yish",
      ],
      c: 0,
    },
    {
      q: "Excel'da =AVERAGE(A1:A10) nima qiladi?",
      o: [
        "A1 dan A10 gacha kataklar yig'indisini hisoblaydi",
        "A1 dan A10 gacha kataklar o'rtachasini hisoblaydi",
        "Eng katta qiymatni topadi",
        "Kataklarni bo'yaydi",
      ],
      c: 1,
    },
    {
      q: "Outlier (chetga chiquvchi qiymat) nima?",
      o: [
        "Boshqa qiymatlardan keskin farq qiladigan qiymat",
        "Eng ko'p uchraydigan qiymat",
        "Nol qiymat",
        "Matnli qiymat",
      ],
      c: 0,
    },
    {
      q: "150 so'mlik mahsulot narxi 180 so'm bo'ldi. O'sish necha foiz?",
      o: ["15%", "20%", "25%", "30%"],
      c: 1,
    },
    {
      q: "Relatsion ma'lumotlar bazasida jadvallar bir-biriga qanday bog'lanadi?",
      o: [
        "Rang orqali",
        "Kalit ustunlar (key) orqali",
        "Fayl nomi orqali",
        "Bog'lanmaydi",
      ],
      c: 1,
    },
    {
      q: "Dashboard (boshqaruv paneli) nima uchun ishlatiladi?",
      o: [
        "Asosiy ko'rsatkichlarni bir joyda vizual kuzatish uchun",
        "Ma'lumotlarni o'chirish uchun",
        "Kod yozish uchun",
        "Fayl almashish uchun",
      ],
      c: 0,
    },
  ]),
  ...toTestQuestions("boshqa", [
    {
      q: "Ishga oid elektron xat qanday boshlangani to'g'ri?",
      o: [
        "\"Salom!\" deb darhol iltimosni yozish",
        "Salomlashish, o'zini tanishtirish va maqsadni qisqa bayon qilish",
        "Mavzusiz bo'sh xat yuborish",
        "Faqat fayl biriktirib yuborish",
      ],
      c: 1,
    },
    {
      q: "Bir kunda 5 ta vazifa bo'lsa, birinchi qaysi biri bajariladi?",
      o: [
        "Eng oson vazifa",
        "Eng muhim va shoshilinch vazifa",
        "Eng yoqqan vazifa",
        "Tasodifiy tanlangan vazifa",
      ],
      c: 1,
    },
    {
      q: "Yig'ilishda aytilgan qarorlarni nima qilish kerak?",
      o: [
        "Eslab qolishga harakat qilish",
        "Yozib olish va mas'ullarga tarqatish",
        "Muhim emas, unutish mumkin",
        "Faqat rahbar yozishi kerak",
      ],
      c: 1,
    },
    {
      q: "Mijoz jahl bilan shikoyat qilsa, birinchi nima qilish kerak?",
      o: [
        "O'zini himoya qilib bahslashish",
        "Tinchlik bilan tinglab, muammoni aniqlashtirish",
        "Telefonni o'chirish",
        "Boshqa xodimga o'tkazib yuborish",
      ],
      c: 1,
    },
    {
      q: "Ish vaqtida topshiriqni tushunmagan bo'lsangiz, nima qilasiz?",
      o: [
        "Taxmin qilib bajarib qo'yaman",
        "Aniqlashtiruvchi savollar beraman",
        "Hech nima qilmayman",
        "Boshqa ish bilan shug'ullanaman",
      ],
      c: 1,
    },
    {
      q: "Kompaniyaning maxfiy ma'lumotini nima qilish kerak?",
      o: [
        "Do'stlarga aytish mumkin",
        "Ijtimoiy tarmoqda ulashish",
        "Faqat ish doirasida, ruxsat berilgan odamlar bilan ishlatish",
        "Raqobatchilarga sotish",
      ],
      c: 2,
    },
    {
      q: "Muddatga ulgurmasligingizni bilsangiz, qachon xabar berasiz?",
      o: [
        "Muddat o'tgandan keyin",
        "Iloji boricha ertaroq, muammoni bilgan zahoti",
        "Hech qachon",
        "So'ralgandagina",
      ],
      c: 1,
    },
    {
      q: "Jamoaviy ishda eng muhimi nima?",
      o: [
        "Har kim faqat o'z ishini o'ylashi",
        "Ochiq muloqot va bir-birini qo'llab-quvvatlash",
        "Raqobat va yakka natija",
        "Rahbarni kutib o'tirish",
      ],
      c: 1,
    },
    {
      q: "Konstruktiv fikr-mulohaza (feedback) qanday bo'ladi?",
      o: [
        "Shaxsni tanqid qiladi",
        "Aniq misollar bilan ishni yaxshilashga qaratilgan bo'ladi",
        "Faqat maqtovdan iborat bo'ladi",
        "Umumiy va noaniq bo'ladi",
      ],
      c: 1,
    },
    {
      q: "Excel/Google Sheets'da ustunni o'sish tartibida saralash nima deyiladi?",
      o: ["Filter", "Sort (saralash)", "Merge", "Format"],
      c: 1,
    },
  ]),
];

// ---------------------------------------------------------------------------
// 2. Demo talents — 24 rows.
// 18 verified (tekshirilgan, 3 per direction) + 6 at earlier statuses.
// ---------------------------------------------------------------------------

type TalentSpec = {
  key: string;
  name: string;
  gender: "men" | "women";
  photo: number;
  birthYear: number;
  city: string;
  direction: Direction;
  level: TalentLevel;
  expYears: number;
  formats: WorkFormat[];
  skills: string[];
  headline: string;
  archetype: Archetype;
  education: string;
  portfolio?: string;
  status: TalentStatus;
  /** days ago the talent was verified (only for tekshirilgan) */
  verifiedDaysAgo?: number;
  /** skill test score — present for test_otgan and later */
  score?: number;
  /** interview rating — verified talents only */
  rating?: number;
};

const TALENT_SPECS: TalentSpec[] = [
  // --- dasturlash ---
  {
    key: "t:1", name: "Jasur Karimov", gender: "men", photo: 32,
    birthYear: 2003, city: "Toshkent", direction: "dasturlash",
    level: "intern", expYears: 1, formats: ["ofis", "aralash"],
    skills: ["JavaScript", "React", "HTML/CSS", "Git"],
    headline: "Frontend dasturchi bo'lishni maqsad qilgan React ixlosmandi",
    archetype: "tahlilchi",
    education: "TATU, dasturiy injiniring (3-kurs)",
    portfolio: "https://github.com/jasurkarimov-dev",
    status: "tekshirilgan", verifiedDaysAgo: 26, score: 88, rating: 5,
  },
  {
    key: "t:2", name: "Dilnoza Rustamova", gender: "women", photo: 44,
    birthYear: 2004, city: "Toshkent", direction: "dasturlash",
    level: "intern", expYears: 0, formats: ["masofaviy", "aralash"],
    skills: ["Python", "Django", "SQL", "Telegram bot"],
    headline: "Python va bot dasturlashga oshiq talaba",
    archetype: "ijrochi",
    education: "Inha universiteti, kompyuter injiniringi (2-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 21, score: 76, rating: 4,
  },
  {
    key: "t:3", name: "Sardor Alimov", gender: "men", photo: 45,
    birthYear: 2001, city: "Samarqand", direction: "dasturlash",
    level: "mutaxassis", expYears: 2, formats: ["masofaviy"],
    skills: ["Node.js", "TypeScript", "PostgreSQL", "REST API"],
    headline: "Ikki yillik tajribaga ega backend dasturchi",
    archetype: "kashfiyotchi",
    education: "SamDU, amaliy matematika (bitiruvchi)",
    portfolio: "https://github.com/sardoralimov",
    status: "tekshirilgan", verifiedDaysAgo: 14, score: 92, rating: 5,
  },
  {
    key: "t:4", name: "Madina Yusupova", gender: "women", photo: 65,
    birthYear: 2005, city: "Andijon", direction: "dasturlash",
    level: "intern", expYears: 0, formats: ["masofaviy"],
    skills: ["HTML/CSS", "JavaScript", "Figma"],
    headline: "Frontend yo'nalishida ilk qadamlarini tashlayotgan talaba",
    archetype: "yaratuvchi",
    education: "AndMI, axborot texnologiyalari (1-kurs)",
    status: "malumot_toldirilgan",
  },
  // --- dizayn ---
  {
    key: "t:5", name: "Kamola Tosheva", gender: "women", photo: 32,
    birthYear: 2002, city: "Toshkent", direction: "dizayn",
    level: "mutaxassis", expYears: 2, formats: ["aralash", "ofis"],
    skills: ["Figma", "UX/UI", "Prototiplash", "Dizayn tizimlari"],
    headline: "Mobil ilovalar uchun UX/UI dizayner",
    archetype: "yaratuvchi",
    education: "Milliy rassomlik va dizayn instituti (bitiruvchi)",
    portfolio: "https://behance.net/kamolatosheva",
    status: "tekshirilgan", verifiedDaysAgo: 24, score: 90, rating: 5,
  },
  {
    key: "t:6", name: "Bekzod Ergashev", gender: "men", photo: 22,
    birthYear: 2003, city: "Namangan", direction: "dizayn",
    level: "intern", expYears: 1, formats: ["masofaviy"],
    skills: ["Figma", "Illustrator", "Banner dizayn", "Brending"],
    headline: "Grafik dizayndan UX sari o'sayotgan ijodkor",
    archetype: "kashfiyotchi",
    education: "NamDU, dizayn yo'nalishi (3-kurs)",
    portfolio: "https://behance.net/bekzodergashev",
    status: "tekshirilgan", verifiedDaysAgo: 18, score: 71, rating: 4,
  },
  {
    key: "t:7", name: "Nilufar Azimova", gender: "women", photo: 12,
    birthYear: 2004, city: "Buxoro", direction: "dizayn",
    level: "intern", expYears: 0, formats: ["masofaviy", "aralash"],
    skills: ["Figma", "Canva", "SMM dizayn"],
    headline: "Ijtimoiy tarmoqlar uchun vizual kontent ustasi",
    archetype: "aloqachi",
    education: "BuxDU, tasviriy san'at (2-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 9, score: 68, rating: 4,
  },
  {
    key: "t:8", name: "Timur Salimov", gender: "men", photo: 36,
    birthYear: 2000, city: "Toshkent", direction: "dizayn",
    level: "mutaxassis", expYears: 3, formats: ["ofis"],
    skills: ["Photoshop", "Illustrator", "3D", "Motion dizayn"],
    headline: "Motion va 3D grafikaga ixtisoslashgan dizayner",
    archetype: "yaratuvchi",
    education: "Kamoliddin Behzod nomidagi institut (bitiruvchi)",
    portfolio: "https://behance.net/timursalimov",
    status: "cv_tayyor",
  },
  // --- marketing ---
  {
    key: "t:9", name: "Aziza Nazarova", gender: "women", photo: 24,
    birthYear: 2002, city: "Toshkent", direction: "marketing",
    level: "mutaxassis", expYears: 2, formats: ["aralash"],
    skills: ["SMM", "Kontent strategiya", "Instagram", "Copywriting"],
    headline: "Brendlarni ijtimoiy tarmoqda o'stiradigan SMM mutaxassis",
    archetype: "aloqachi",
    education: "O'zJOKU, jurnalistika (bitiruvchi)",
    status: "tekshirilgan", verifiedDaysAgo: 27, score: 84, rating: 5,
  },
  {
    key: "t:10", name: "Ulug'bek Hamidov", gender: "men", photo: 57,
    birthYear: 2003, city: "Farg'ona", direction: "marketing",
    level: "intern", expYears: 1, formats: ["masofaviy"],
    skills: ["Target reklama", "Meta Ads", "Analitika"],
    headline: "Target reklama bo'yicha amaliyot izlayotgan yosh marketolog",
    archetype: "tahlilchi",
    education: "FarDU, iqtisodiyot (3-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 16, score: 79, rating: 4,
  },
  {
    key: "t:11", name: "Sevinch Qodirova", gender: "women", photo: 68,
    birthYear: 2005, city: "Samarqand", direction: "marketing",
    level: "intern", expYears: 0, formats: ["masofaviy", "aralash"],
    skills: ["Kontent yozish", "SMM", "Video montaj"],
    headline: "Kontent yaratishga ishtiyoqli talaba",
    archetype: "yaratuvchi",
    education: "SamDChTI, filologiya (2-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 6, score: 73, rating: 4,
  },
  {
    key: "t:12", name: "Javohir Toshpulatov", gender: "men", photo: 75,
    birthYear: 2004, city: "Toshkent", direction: "marketing",
    level: "intern", expYears: 1, formats: ["ofis", "aralash"],
    skills: ["SMM", "Telegram kanal", "Kreativ"],
    headline: "Telegram marketingida tajriba orttirayotgan yigit",
    archetype: "kashfiyotchi",
    education: "TDIU, marketing (2-kurs)",
    status: "test_otgan", score: 66,
  },
  // --- sotuv ---
  {
    key: "t:13", name: "Botir Ismoilov", gender: "men", photo: 64,
    birthYear: 2000, city: "Toshkent", direction: "sotuv",
    level: "mutaxassis", expYears: 3, formats: ["ofis"],
    skills: ["B2B sotuv", "Muzokara", "CRM", "Sovuq qo'ng'iroq"],
    headline: "B2B sotuvda uch yillik tajribali menejer",
    archetype: "yetakchi",
    education: "TDIU, menejment (bitiruvchi)",
    status: "tekshirilgan", verifiedDaysAgo: 25, score: 87, rating: 5,
  },
  {
    key: "t:14", name: "Gulnora Sattorova", gender: "women", photo: 51,
    birthYear: 2003, city: "Buxoro", direction: "sotuv",
    level: "intern", expYears: 1, formats: ["ofis", "aralash"],
    skills: ["Mijozlar bilan ishlash", "Telefon sotuvi", "CRM"],
    headline: "Mijozlar bilan iliq munosabat quradigan sotuvchi",
    archetype: "aloqachi",
    education: "BuxDU, iqtisodiyot (3-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 12, score: 74, rating: 4,
  },
  {
    key: "t:15", name: "Otabek Ruziyev", gender: "men", photo: 83,
    birthYear: 2004, city: "Andijon", direction: "sotuv",
    level: "intern", expYears: 0, formats: ["ofis"],
    skills: ["Savdo maslahati", "Kassa", "Mijoz xizmati"],
    headline: "Chakana savdoda o'sishni istagan g'ayratli yigit",
    archetype: "ijrochi",
    education: "Andijon savdo kolleji (bitiruvchi)",
    status: "tekshirilgan", verifiedDaysAgo: 4, score: 65, rating: 4,
  },
  {
    key: "t:16", name: "Zarina Mirzayeva", gender: "women", photo: 57,
    birthYear: 2005, city: "Toshkent", direction: "sotuv",
    level: "intern", expYears: 0, formats: ["aralash"],
    skills: ["Onlayn sotuv", "Instagram do'kon", "Mijoz xizmati"],
    headline: "Onlayn savdoni o'rganayotgan faol talaba",
    archetype: "aloqachi",
    education: "TDIU, marketing (1-kurs)",
    status: "suhbat_belgilangan", score: 70,
  },
  // --- data ---
  {
    key: "t:17", name: "Farrux Abdullayev", gender: "men", photo: 14,
    birthYear: 2001, city: "Toshkent", direction: "data",
    level: "mutaxassis", expYears: 2, formats: ["aralash", "masofaviy"],
    skills: ["SQL", "Excel", "Power BI", "Python"],
    headline: "Ma'lumotlardan xulosa chiqaradigan tahlilchi",
    archetype: "tahlilchi",
    education: "TATU, axborot tizimlari (bitiruvchi)",
    status: "tekshirilgan", verifiedDaysAgo: 23, score: 94, rating: 5,
  },
  {
    key: "t:18", name: "Shahnoza Islomova", gender: "women", photo: 89,
    birthYear: 2004, city: "Namangan", direction: "data",
    level: "intern", expYears: 0, formats: ["masofaviy"],
    skills: ["Excel", "Google Sheets", "Statistika"],
    headline: "Data analitikaga endi kirib kelayotgan sinchkov talaba",
    archetype: "tahlilchi",
    education: "NamDU, matematika (2-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 11, score: 78, rating: 4,
  },
  {
    key: "t:19", name: "Doston Yo'ldoshev", gender: "men", photo: 91,
    birthYear: 2002, city: "Samarqand", direction: "data",
    level: "intern", expYears: 1, formats: ["masofaviy", "aralash"],
    skills: ["SQL", "Tableau", "Data tozalash"],
    headline: "Vizualizatsiya va hisobotlarga qiziquvchi tahlilchi",
    archetype: "kashfiyotchi",
    education: "SamDU, statistika (4-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 8, score: 81, rating: 4,
  },
  {
    key: "t:20", name: "Mohira Karimova", gender: "women", photo: 35,
    birthYear: 2006, city: "Farg'ona", direction: "data",
    level: "intern", expYears: 0, formats: ["masofaviy"],
    skills: ["Excel", "Matematika", "Statistika"],
    headline: "Matematikaga kuchli, data sohasiga intilayotgan talaba",
    archetype: "tahlilchi",
    education: "FarDU, amaliy matematika (1-kurs)",
    status: "malumot_toldirilgan",
  },
  // --- boshqa ---
  {
    key: "t:21", name: "Akmal Nosirov", gender: "men", photo: 47,
    birthYear: 1999, city: "Toshkent", direction: "boshqa",
    level: "mutaxassis", expYears: 4, formats: ["ofis"],
    skills: ["Ofis menejment", "Hujjat yuritish", "1C"],
    headline: "Ofis jarayonlarini tartibga soladigan tajribali ma'mur",
    archetype: "ijrochi",
    education: "TDYU, boshqaruv (bitiruvchi)",
    status: "tekshirilgan", verifiedDaysAgo: 20, score: 82, rating: 5,
  },
  {
    key: "t:22", name: "Lola Sharipova", gender: "women", photo: 79,
    birthYear: 2003, city: "Buxoro", direction: "boshqa",
    level: "intern", expYears: 1, formats: ["ofis", "aralash"],
    skills: ["Call-markaz", "Mijoz xizmati", "Rus tili"],
    headline: "Mijozlar xizmatida tajribali, o'sishga chanqoq",
    archetype: "aloqachi",
    education: "BuxDU, filologiya (3-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 15, score: 77, rating: 4,
  },
  {
    key: "t:23", name: "Rustam Qosimov", gender: "men", photo: 28,
    birthYear: 2002, city: "Andijon", direction: "boshqa",
    level: "intern", expYears: 1, formats: ["ofis"],
    skills: ["Logistika", "Excel", "Omborxona hisobi"],
    headline: "Logistika yo'nalishida amaliyot izlayotgan yigit",
    archetype: "ijrochi",
    education: "AndMI, logistika (4-kurs)",
    status: "tekshirilgan", verifiedDaysAgo: 3, score: 69, rating: 4,
  },
  {
    key: "t:24", name: "Feruza Ahmedova", gender: "women", photo: 26,
    birthYear: 2005, city: "Toshkent", direction: "boshqa",
    level: "intern", expYears: 0, formats: ["aralash"],
    skills: ["HR yordamchisi", "Muloqot", "Ingliz tili"],
    headline: "HR sohasida karyera boshlamoqchi bo'lgan faol talaba",
    archetype: "yetakchi",
    education: "O'zMU, psixologiya (2-kurs)",
    status: "test_otgan", score: 72,
  },
];

// --- expansion into DB rows -------------------------------------------------

const DIRECTION_TITLES: Record<Direction, string> = {
  dasturlash: "dasturchi",
  dizayn: "dizayner",
  marketing: "marketolog",
  sotuv: "sotuv mutaxassisi",
  data: "data tahlilchi",
  boshqa: "mutaxassis",
};

function talentCreatedDaysAgo(spec: TalentSpec): number {
  return (spec.verifiedDaysAgo ?? 2) + 10;
}

function buildTalentRow(spec: TalentSpec): TalentInsert {
  const arch = ARCHETYPES[spec.archetype];
  return {
    id: demoId(spec.key),
    user_id: null,
    full_name: spec.name,
    birth_year: spec.birthYear,
    city: spec.city,
    direction: spec.direction,
    education: spec.education,
    free_text: spec.headline,
    portfolio_url: spec.portfolio ?? null,
    status: spec.status,
    bot_state: {},
    verified_at:
      spec.verifiedDaysAgo === undefined ? null : daysAgo(spec.verifiedDaysAgo),
    created_at: daysAgo(talentCreatedDaysAgo(spec)),
    photo_url: `https://randomuser.me/api/portraits/${spec.gender}/${spec.photo}.jpg`,
    is_demo: true,
    level: spec.level,
    experience_years: spec.expYears,
    work_formats: spec.formats,
    skill_tags: spec.skills,
    headline: spec.headline,
    personality: {
      archetype: spec.archetype,
      archetype_code: spec.archetype,
      archetype_label: arch.label,
      tagline: arch.tagline,
      traits: arch.traits,
      strengths: arch.traits,
      completed_at: daysAgo(talentCreatedDaysAgo(spec) - 1),
    } as PersonalityResult,
  };
}

/** Statuses at/after which the given artefact exists. */
const HAS_CV: TalentStatus[] = [
  "cv_tayyor", "test_otgan", "suhbat_belgilangan", "tekshirilgan",
];
const HAS_TEST: TalentStatus[] = [
  "test_otgan", "suhbat_belgilangan", "tekshirilgan",
];

function buildCvProfile(spec: TalentSpec): CvProfileInsert {
  const title = DIRECTION_TITLES[spec.direction];
  const levelUz = spec.level === "intern" ? "amaliyotchi" : "mutaxassis";
  const experience: CvExperienceItem[] = [
    {
      title: `${spec.level === "intern" ? "Amaliyotchi" : "Yosh"} ${title}`,
      org: spec.expYears > 0 ? "Frilans va buyurtma loyihalar" : "O'quv loyihalari",
      period: spec.expYears > 0 ? `${2026 - spec.expYears} – hozirgacha` : "2025 – hozirgacha",
      bullets: [
        `${spec.skills[0] ?? "Asosiy yo'nalish"} bo'yicha amaliy loyihalar ustida ishlagan`,
        "Jamoaviy muhitda vazifalarni muddatida topshirgan",
      ],
    },
  ];
  return {
    id: demoId(`cv:${spec.key}`),
    talent_id: demoId(spec.key),
    summary:
      `${spec.name} — ${spec.city} shahridan ${levelUz} ${title}. ` +
      `${spec.headline}. Asosiy kuchli tomonlari: ${spec.skills.slice(0, 3).join(", ")}. ` +
      `O'z yo'nalishida tez o'rganishga va real loyihalarda tajriba orttirishga intiladi.`,
    skills: spec.skills,
    experience,
    ai_verdict:
      `Nomzod ${ARCHETYPES[spec.archetype].label.toLowerCase()} arxetipiga ega: ` +
      `${ARCHETYPES[spec.archetype].tagline.toLowerCase()}. ` +
      `${spec.direction} yo'nalishidagi bazaviy bilimlari mustahkam, ` +
      `amaliyot orqali tez o'sish salohiyati yuqori.`,
    generated_at: daysAgo(talentCreatedDaysAgo(spec) - 2),
    // pdf_path intentionally omitted: the bot's pdfWorker fills it and a
    // seed re-run must not reset it back to null.
  };
}

function buildSkillTest(spec: TalentSpec): SkillTestInsert {
  const score = spec.score ?? 70;
  return {
    id: demoId(`st:${spec.key}`),
    talent_id: demoId(spec.key),
    direction: spec.direction,
    score,
    answers: { demo: true, correct: Math.round(score / 10), total: 10 },
    passed_at: daysAgo(talentCreatedDaysAgo(spec) - 4),
  };
}

function buildInterview(spec: TalentSpec): InterviewInsert {
  const verified = spec.status === "tekshirilgan";
  const base: InterviewInsert = {
    id: demoId(`iv:${spec.key}`),
    talent_id: demoId(spec.key),
    moderator_id: null,
    // suhbat_belgilangan: interview is 2 days in the future, undecided
    scheduled_at: verified ? daysAgo((spec.verifiedDaysAgo ?? 2) + 1) : daysAgo(-2, 11),
    created_at: daysAgo(verified ? (spec.verifiedDaysAgo ?? 2) + 3 : 1),
  };
  if (!verified) return base;
  return {
    ...base,
    rating: spec.rating ?? 4,
    notes: "Muloqoti ravon, motivatsiyasi kuchli. Amaliyotga tayyor.",
    decision: "approved",
    decided_at: daysAgo(spec.verifiedDaysAgo ?? 2),
  };
}

const TALENT_ROWS: TalentInsert[] = TALENT_SPECS.map(buildTalentRow);
const CV_PROFILE_ROWS: CvProfileInsert[] = TALENT_SPECS.filter((s) =>
  HAS_CV.includes(s.status),
).map(buildCvProfile);
const SKILL_TEST_ROWS: SkillTestInsert[] = TALENT_SPECS.filter((s) =>
  HAS_TEST.includes(s.status),
).map(buildSkillTest);
const INTERVIEW_ROWS: InterviewInsert[] = TALENT_SPECS.filter(
  (s) => s.status === "tekshirilgan" || s.status === "suhbat_belgilangan",
).map(buildInterview);

// ---------------------------------------------------------------------------
// 3. Demo companies — 8 rows.
// ---------------------------------------------------------------------------

type CompanySpec = {
  key: string;
  name: string;
  initials: string;
  contact: string;
  phone: string;
  kind: NonNullable<CompanyInsert["kind"]>;
  city: string;
  activity: string;
  directions: Direction[];
  level: NonNullable<CompanyInsert["needed_level"]>;
  urgency: NonNullable<CompanyInsert["urgency"]>;
  description: string;
  status: NonNullable<CompanyInsert["status"]>;
  createdDaysAgo: number;
};

const COMPANY_SPECS: CompanySpec[] = [
  {
    key: "c:1", name: "TechNova Solutions", initials: "TN",
    contact: "Anvar Yusupov", phone: "+998901112233",
    kind: "startup", city: "Toshkent", activity: "IT va dasturiy ta'minot",
    directions: ["dasturlash", "dizayn"], level: "intern", urgency: "hoziroq",
    description:
      "O'z mahsulotlarini yaratayotgan yosh IT-startap. Frontend va dizayn bo'yicha amaliyotchilarni jamoaga qo'shmoqchimiz.",
    status: "boglanildi", createdDaysAgo: 19,
  },
  {
    key: "c:2", name: "Digital Plov Agency", initials: "DP",
    contact: "Malika Rahimova", phone: "+998935557788",
    kind: "kompaniya", city: "Toshkent", activity: "Marketing agentligi",
    directions: ["marketing", "dizayn"], level: "ikkalasi", urgency: "oy_ichida",
    description:
      "Brendlar uchun SMM va kreativ xizmatlar ko'rsatuvchi agentlik. Kontent va target bo'yicha g'ayratli mutaxassislar kerak.",
    status: "yangi", createdDaysAgo: 6,
  },
  {
    key: "c:3", name: "SamMarket Savdo", initials: "SM",
    contact: "Jahongir Islomov", phone: "+998907779911",
    kind: "kompaniya", city: "Samarqand", activity: "Chakana savdo tarmog'i",
    directions: ["sotuv", "marketing"], level: "intern", urgency: "hoziroq",
    description:
      "Samarqanddagi 6 ta do'kondan iborat savdo tarmog'i. Sotuv bo'limiga yosh va faol amaliyotchilar izlaymiz.",
    status: "nomzod_yuborildi", createdDaysAgo: 15,
  },
  {
    key: "c:4", name: "EduBridge O'quv Markazi", initials: "EB",
    contact: "Nodira Karimova", phone: "+998998883344",
    kind: "tashkilot", city: "Toshkent", activity: "Ta'lim markazi",
    directions: ["boshqa", "marketing"], level: "intern", urgency: "korib_turibman",
    description:
      "Chet tillari va IT kurslarini olib boruvchi o'quv markazi. Administrator va SMM yordamchisi kerak bo'lishi mumkin.",
    status: "yangi", createdDaysAgo: 4,
  },
  {
    key: "c:5", name: "AgroTex Farg'ona", initials: "AF",
    contact: "Bahodir Tursunov", phone: "+998912224455",
    kind: "kompaniya", city: "Farg'ona", activity: "Qishloq xo'jaligi texnikasi ishlab chiqarish",
    directions: ["data", "sotuv"], level: "mutaxassis", urgency: "oy_ichida",
    description:
      "Farg'onadagi ishlab chiqarish korxonasi. Sotuv hisobotlarini tahlil qiladigan mutaxassis izlayapmiz.",
    status: "boglanildi", createdDaysAgo: 12,
  },
  {
    key: "c:6", name: "Buxoro Textile Group", initials: "BT",
    contact: "Sherzod Hamdamov", phone: "+998936665522",
    kind: "kompaniya", city: "Buxoro", activity: "To'qimachilik ishlab chiqarish",
    directions: ["sotuv", "boshqa"], level: "intern", urgency: "korib_turibman",
    description:
      "Eksportga yo'naltirilgan to'qimachilik korxonasi. Sotuv va ofis ishlari bo'yicha yordamchilar kerak.",
    status: "yangi", createdDaysAgo: 9,
  },
  {
    key: "c:7", name: "DataPulse Analytics", initials: "DA",
    contact: "Kamila Azizova", phone: "+998971114499",
    kind: "startup", city: "Toshkent", activity: "Ma'lumotlar tahlili xizmatlari",
    directions: ["data", "dasturlash"], level: "ikkalasi", urgency: "hoziroq",
    description:
      "Biznes uchun analitika panellari quradigan startap. SQL va Python biladigan yosh tahlilchilarga ochiqmiz.",
    status: "nomzod_yuborildi", createdDaysAgo: 17,
  },
  {
    key: "c:8", name: "Olim aka do'konlari", initials: "OD",
    contact: "Olimjon Sodiqov", phone: "+998943338866",
    kind: "shaxsiy", city: "Andijon", activity: "Oziq-ovqat savdo tarmog'i",
    directions: ["sotuv"], level: "intern", urgency: "hoziroq",
    description:
      "Andijondagi 3 ta oilaviy do'kon. Savdo maslahatchisi sifatida ishlaydigan halol yigit-qizlar kerak.",
    status: "boglanildi", createdDaysAgo: 8,
  },
];

function buildCompanyRow(spec: CompanySpec): CompanyInsert {
  return {
    id: demoId(spec.key),
    name: spec.name,
    contact_name: spec.contact,
    phone_tg: spec.phone,
    direction_needed: spec.directions[0] ?? null,
    status: spec.status,
    notes: null,
    created_at: daysAgo(spec.createdDaysAgo),
    logo_url: `https://ui-avatars.com/api/?name=${spec.initials}&background=F26430&color=fff`,
    is_demo: true,
    description: spec.description,
    user_id: null,
    kind: spec.kind,
    city: spec.city,
    activity_type: spec.activity,
    directions_needed: spec.directions,
    needed_level: spec.level,
    urgency: spec.urgency,
  };
}

const COMPANY_ROWS: CompanyInsert[] = COMPANY_SPECS.map(buildCompanyRow);

// ---------------------------------------------------------------------------
// 4. Demo requests — 10 rows (6 company→talent, 4 talent→company).
// ---------------------------------------------------------------------------

type RequestSpec = {
  key: string;
  kind: RequestInsert["kind"];
  company: string;
  talent: string;
  direction: Direction;
  note: string;
  status: NonNullable<RequestInsert["status"]>;
  createdDaysAgo: number;
};

const REQUEST_SPECS: RequestSpec[] = [
  {
    key: "r:1", kind: "kompaniya_sorovi", company: "c:1", talent: "t:1",
    direction: "dasturlash", status: "yangi", createdDaysAgo: 1,
    note: "React amaliyotchisi sifatida jamoamizga mos ko'rinadi.",
  },
  {
    key: "r:2", kind: "kompaniya_sorovi", company: "c:1", talent: "t:5",
    direction: "dizayn", status: "korildi", createdDaysAgo: 3,
    note: "Mahsulot interfeysi dizayni uchun tajribasi qiziqarli.",
  },
  {
    key: "r:3", kind: "kompaniya_sorovi", company: "c:3", talent: "t:14",
    direction: "sotuv", status: "boglanildi", createdDaysAgo: 7,
    note: "Buxorolik bo'lgani uchun mintaqaviy filialga ham mos.",
  },
  {
    key: "r:4", kind: "kompaniya_sorovi", company: "c:5", talent: "t:17",
    direction: "data", status: "korildi", createdDaysAgo: 5,
    note: "Ishlab chiqarish hisobotlarini tahlil qilish uchun kerak.",
  },
  {
    key: "r:5", kind: "kompaniya_sorovi", company: "c:7", talent: "t:19",
    direction: "data", status: "yangi", createdDaysAgo: 2,
    note: "Tableau ko'nikmasi loyihamizga juda mos.",
  },
  {
    key: "r:6", kind: "kompaniya_sorovi", company: "c:8", talent: "t:15",
    direction: "sotuv", status: "boglanildi", createdDaysAgo: 6,
    note: "Andijondagi do'konimiz uchun yaqin joyda yashaydi.",
  },
  {
    key: "r:7", kind: "talant_qiziqishi", company: "c:2", talent: "t:9",
    direction: "marketing", status: "yangi", createdDaysAgo: 1,
    note: "SMM strategiya bo'yicha jamoada ishlashni xohlayman.",
  },
  {
    key: "r:8", kind: "talant_qiziqishi", company: "c:7", talent: "t:2",
    direction: "dasturlash", status: "korildi", createdDaysAgo: 4,
    note: "Data loyihalarida Python tajribamni oshirmoqchiman.",
  },
  {
    key: "r:9", kind: "talant_qiziqishi", company: "c:4", talent: "t:22",
    direction: "boshqa", status: "yangi", createdDaysAgo: 2,
    note: "O'quv markazida administrator bo'lib ishlashni istayman.",
  },
  {
    key: "r:10", kind: "talant_qiziqishi", company: "c:6", talent: "t:13",
    direction: "sotuv", status: "boglanildi", createdDaysAgo: 9,
    note: "B2B sotuv tajribamni to'qimachilik sohasida qo'llamoqchiman.",
  },
];

const REQUEST_ROWS: RequestInsert[] = REQUEST_SPECS.map((spec) => ({
  id: demoId(spec.key),
  kind: spec.kind,
  company_id: demoId(spec.company),
  talent_id: demoId(spec.talent),
  direction: spec.direction,
  note: spec.note,
  status: spec.status,
  created_at: daysAgo(spec.createdDaysAgo, 14),
}));

// ---------------------------------------------------------------------------
// 5. status_log — one creation row per demo entity (guardrail #8).
// Deterministic ids keep re-runs from duplicating log rows.
// ---------------------------------------------------------------------------

const STATUS_LOG_ROWS: StatusLogInsert[] = [
  ...TALENT_SPECS.map((s) => ({
    id: demoId(`sl:${s.key}`),
    entity: "talent",
    entity_id: demoId(s.key),
    old_status: null,
    new_status: s.status,
    changed_by: "seed-demo",
    created_at: daysAgo(talentCreatedDaysAgo(s)),
  })),
  ...COMPANY_SPECS.map((s) => ({
    id: demoId(`sl:${s.key}`),
    entity: "company",
    entity_id: demoId(s.key),
    old_status: null,
    new_status: s.status,
    changed_by: "seed-demo",
    created_at: daysAgo(s.createdDaysAgo),
  })),
  ...REQUEST_SPECS.map((s) => ({
    id: demoId(`sl:${s.key}`),
    entity: "request",
    entity_id: demoId(s.key),
    old_status: null,
    new_status: s.status,
    changed_by: "seed-demo",
    created_at: daysAgo(s.createdDaysAgo, 14),
  })),
];

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

type RealSnapshot = { talents: unknown; companies: unknown };

async function snapshotRealRows(sb: TalantlyClient): Promise<RealSnapshot> {
  const [talents, companies] = await Promise.all([
    sb
      .from("talents")
      .select("id, full_name, status, direction")
      .eq("is_demo", false)
      .order("id"),
    sb
      .from("companies")
      .select("id, name, status")
      .eq("is_demo", false)
      .order("id"),
  ]);
  if (talents.error) throw new Error(`real talents read: ${talents.error.message}`);
  if (companies.error) throw new Error(`real companies read: ${companies.error.message}`);
  return { talents: talents.data, companies: companies.data };
}

async function main(): Promise<void> {
  const sb = createServiceClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  );

  console.log("== talantly demo seed ==");
  const before = await snapshotRealRows(sb);

  const steps: Array<[string, () => PromiseLike<{ error: { message: string } | null }>, number]> = [
    ["personality_questions", () => sb.from("personality_questions").upsert(PERSONALITY_QUESTIONS), PERSONALITY_QUESTIONS.length],
    ["test_questions", () => sb.from("test_questions").upsert(TEST_QUESTIONS), TEST_QUESTIONS.length],
    ["talents", () => sb.from("talents").upsert(TALENT_ROWS), TALENT_ROWS.length],
    ["cv_profiles", () => sb.from("cv_profiles").upsert(CV_PROFILE_ROWS), CV_PROFILE_ROWS.length],
    ["skill_tests", () => sb.from("skill_tests").upsert(SKILL_TEST_ROWS), SKILL_TEST_ROWS.length],
    ["interviews", () => sb.from("interviews").upsert(INTERVIEW_ROWS), INTERVIEW_ROWS.length],
    ["companies", () => sb.from("companies").upsert(COMPANY_ROWS), COMPANY_ROWS.length],
    ["requests", () => sb.from("requests").upsert(REQUEST_ROWS), REQUEST_ROWS.length],
    ["status_log", () => sb.from("status_log").upsert(STATUS_LOG_ROWS), STATUS_LOG_ROWS.length],
  ];
  for (const [table, run, n] of steps) {
    const { error } = await run();
    if (error) throw new Error(`${table} upsert failed: ${error.message}`);
    console.log(`  upserted ${String(n).padStart(3)} rows -> ${table}`);
  }

  // --- verification ---------------------------------------------------------
  console.log("\n== verification (cloud) ==");

  const pq = await sb
    .from("personality_questions")
    .select("id", { count: "exact" })
    .eq("is_active", true)
    .limit(0);
  console.log(`personality_questions active: ${pq.count}`);

  const tq = await sb.from("test_questions").select("direction").eq("is_active", true);
  if (tq.error) throw new Error(tq.error.message);
  const byDirection = new Map<string, number>();
  for (const row of tq.data ?? []) {
    byDirection.set(row.direction, (byDirection.get(row.direction) ?? 0) + 1);
  }
  console.log("test_questions active per direction:", Object.fromEntries(byDirection));

  const demoTalents = await sb
    .from("talents")
    .select("full_name, direction, level, city, status")
    .eq("is_demo", true)
    .order("created_at");
  if (demoTalents.error) throw new Error(demoTalents.error.message);
  const byStatus = new Map<string, number>();
  for (const t of demoTalents.data ?? []) {
    byStatus.set(t.status, (byStatus.get(t.status) ?? 0) + 1);
  }
  console.log(`demo talents: ${demoTalents.data?.length}`, Object.fromEntries(byStatus));
  console.log("sample talents:", JSON.stringify(demoTalents.data?.slice(0, 3), null, 2));

  const demoCompanies = await sb
    .from("companies")
    .select("name, kind, city, needed_level, urgency, status")
    .eq("is_demo", true)
    .order("created_at");
  if (demoCompanies.error) throw new Error(demoCompanies.error.message);
  console.log(`demo companies: ${demoCompanies.data?.length}`);
  console.log("sample companies:", JSON.stringify(demoCompanies.data?.slice(0, 3), null, 2));

  const requests = await sb
    .from("requests")
    .select("kind, direction, status, note")
    .order("created_at");
  if (requests.error) throw new Error(requests.error.message);
  console.log(`requests: ${requests.data?.length}`);
  console.log("sample requests:", JSON.stringify(requests.data?.slice(0, 3), null, 2));

  const related = await Promise.all([
    sb.from("cv_profiles").select("id", { count: "exact" }).limit(0),
    sb.from("skill_tests").select("id", { count: "exact" }).limit(0),
    sb.from("interviews").select("id", { count: "exact" }).limit(0),
  ]);
  console.log(
    `cv_profiles total: ${related[0].count}, skill_tests total: ${related[1].count}, interviews total: ${related[2].count}`,
  );

  const after = await snapshotRealRows(sb);
  const untouched = JSON.stringify(before) === JSON.stringify(after);
  console.log(`real rows (is_demo=false) untouched: ${untouched ? "YES" : "NO — INVESTIGATE"}`);
  if (!untouched) {
    console.error("BEFORE:", JSON.stringify(before));
    console.error("AFTER:", JSON.stringify(after));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exitCode = 1;
});
