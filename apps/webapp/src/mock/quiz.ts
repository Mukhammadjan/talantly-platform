export interface Question {
  id: string;
  question: string;
  options: string[];
}

export const PERSONALITY_QUESTIONS: Question[] = [
  { id: "p1", question: "Yangi vazifa oldingizda — nimadan boshlaysiz?", options: ["Reja tuzaman", "Darhol harakatga o'taman", "Boshqalar bilan maslahatlashaman", "Ma'lumot yig'aman"] },
  { id: "p2", question: "Jamoada o'zingizni qanday his qilasiz?", options: ["Yetakchi", "Ijodkor", "Tahlilchi", "Qo'llab-quvvatlovchi"] },
  { id: "p3", question: "Muammoni qanday hal qilasiz?", options: ["Mantiq bilan", "Intuitiv", "Boshqalar bilan", "Tajriba orqali"] },
  { id: "p4", question: "Bo'sh vaqtda nimani afzal ko'rasiz?", options: ["Yangi narsa o'rganish", "Do'stlar bilan", "Yolg'iz dam olish", "Biror loyiha ustida"] },
  { id: "p5", question: "Qaror qabul qilishda nimaga tayanasiz?", options: ["Faktlarga", "Hissiyotga", "Tajribaga", "Maslahatga"] },
  { id: "p6", question: "Ish uslubingiz qanaqa?", options: ["Tartibli", "Moslashuvchan", "Tez", "Puxta"] },
  { id: "p7", question: "Xatoga qanday qaraysiz?", options: ["O'rganish imkoni", "Tuzataman", "Tahlil qilaman", "Oldini olaman"] },
  { id: "p8", question: "Sizni nima ko'proq ruhlantiradi?", options: ["Natija", "Yangilik", "Jamoa", "Barqarorlik"] },
  { id: "p9", question: "Qiyin vaziyatda?", options: ["Sokin qolaman", "Yechim izlayman", "Yordam so'rayman", "Reja o'zgartiraman"] },
  { id: "p10", question: "Muloqotda qanaqasiz?", options: ["Ochiq", "Diqqatli tinglovchi", "To'g'ridan-to'g'ri", "Ehtiyotkor"] },
  { id: "p11", question: "Loyihada eng muhimi?", options: ["Sifat", "Tezlik", "Jamoa", "Innovatsiya"] },
  { id: "p12", question: "Yangi odamlar bilan?", options: ["Oson tanishaman", "Kuzataman", "Ish orqali", "Sekin yaqinlashaman"] },
  { id: "p13", question: "Vaqtingizni qanday boshqarasiz?", options: ["Qat'iy reja", "Ustuvorlik bo'yicha", "Moslashib", "Deadline bilan"] },
  { id: "p14", question: "Sizga qaysi maqtov yoqadi?", options: ["Aqlli", "Ijodkor", "Ishonchli", "Tashabbuskor"] },
  { id: "p15", question: "Kelajakni qanday ko'rasiz?", options: ["Rejalashtirilgan", "Ochiq imkoniyatlar", "Barqaror", "O'sish"] },
];

export const SKILL_QUESTIONS: Question[] = [
  { id: "s1", question: "HTML'da sarlavha uchun qaysi teg ishlatiladi?", options: ["<h1>", "<head>", "<title>", "<header>"] },
  { id: "s2", question: "CSS'da rang qanday beriladi?", options: ["color", "background", "font", "text"] },
  { id: "s3", question: "JavaScript qaysi turdagi til?", options: ["Skript", "Kompilyatsiya", "Assembler", "Markup"] },
  { id: "s4", question: "Massiv uzunligi qanday olinadi?", options: [".length", ".size", ".count", ".len"] },
  { id: "s5", question: "React komponenti nima qaytaradi?", options: ["JSX", "HTML fayl", "CSS", "JSON"] },
  { id: "s6", question: "let va const farqi?", options: ["const o'zgармас", "farqi yo'q", "let global", "const massiv"] },
  { id: "s7", question: "== va === farqi?", options: ["=== tur ham tekshiradi", "farqi yo'q", "== tezroq", "=== faqat son"] },
  { id: "s8", question: "Funksiya qanday e'lon qilinadi?", options: ["function", "func", "def", "fn"] },
  { id: "s9", question: "DOM nima?", options: ["Sahifa strukturasi", "Ma'lumotlar bazasi", "Server", "Kutubxona"] },
  { id: "s10", question: "API nima uchun kerak?", options: ["Ma'lumot almashish", "Dizayn", "Xotira", "Animatsiya"] },
];

export interface Slot {
  id: string;
  date: string;
  label: string;
  times: { id: string; time: string; taken: boolean }[];
}

export const SLOTS: Slot[] = [
  {
    id: "d1",
    date: "16-iyul",
    label: "Chor",
    times: [
      { id: "t1", time: "10:00", taken: false },
      { id: "t2", time: "11:30", taken: true },
      { id: "t3", time: "14:00", taken: false },
      { id: "t4", time: "16:00", taken: false },
    ],
  },
  {
    id: "d2",
    date: "17-iyul",
    label: "Pay",
    times: [
      { id: "t5", time: "09:30", taken: false },
      { id: "t6", time: "12:00", taken: false },
      { id: "t7", time: "15:30", taken: true },
    ],
  },
  {
    id: "d3",
    date: "18-iyul",
    label: "Jum",
    times: [
      { id: "t8", time: "10:00", taken: false },
      { id: "t9", time: "13:00", taken: false },
    ],
  },
];

export interface CvMock {
  summary: string;
  skills: string[];
  experience: { title: string; org: string; period: string }[];
  verdict: string;
}

export const CV_MOCK: CvMock = {
  summary:
    "Frontend yo'nalishida rivojlanayotgan dasturchi. React va zamonaviy JavaScript bilan interfeyslar yaratadi, tez o'rganadi va jamoada ishlaydi.",
  skills: ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Git"],
  experience: [
    { title: "Frontend amaliyotchi", org: "Startup loyiha", period: "2024 — hozir" },
    { title: "Shaxsiy loyihalar", org: "Portfolio", period: "2023 — 2024" },
  ],
  verdict:
    "Nomzod asosiy frontend ko'nikmalarni egallagan, amaliyotga tayyor va o'sish salohiyati yuqori.",
};
