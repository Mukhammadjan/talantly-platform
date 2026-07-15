// Mock domain data for the recruiter (ish beruvchi) side of Talantly.
// Static fixtures only — no network. All copy is Uzbek Latin, "siz" tone.

export interface Candidate {
  id: string;
  name: string;
  archetype: string;
  role: string;
  skills: string[];
  score: number;
  district: string;
  verified: boolean;
  experience: string;
  about: string;
  rate: string;
  tone: string; // avatar accent (hsl hue base handled in Avatar)
  premium: boolean; // locked behind unlock/subscription for guests
}

export interface Zone {
  id: string;
  district: string;
  count: number;
  // Position on the stylized map canvas, as % of container.
  x: number;
  y: number;
}

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  candidateId: string;
  messages: ChatMessage[];
}

export interface BoardItem {
  candidateId: string;
  note: string;
  time: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "application" | "message" | "system";
  unread: boolean;
}

export const CANDIDATES: Candidate[] = [
  {
    id: "dilnoza",
    name: "Dilnoza Karimova",
    archetype: "Strateg-quruvchi",
    role: "Product dizayner",
    skills: ["Figma", "UX tadqiqot", "Design system"],
    score: 92,
    district: "Chilonzor",
    verified: true,
    experience: "4 yil tajriba",
    about:
      "Foydalanuvchiga yo'naltirilgan mahsulot dizayneri. Fintech va ta'lim ilovalarida ishlagan, jamoada dizayn tizimini noldan qurgan.",
    rate: "9 000 000 so'm/oy",
    tone: "orange",
    premium: false,
  },
  {
    id: "jasur",
    name: "Jasur To'xtayev",
    archetype: "Tahlilchi-injener",
    role: "Frontend dasturchi",
    skills: ["React", "TypeScript", "Next.js"],
    score: 88,
    district: "Yunusobod",
    verified: true,
    experience: "3 yil tajriba",
    about:
      "Zamonaviy veb ilovalar quruvchi frontend dasturchi. Katta trafikli marketplace loyihalarida ishlagan.",
    rate: "12 000 000 so'm/oy",
    tone: "blue",
    premium: false,
  },
  {
    id: "malika",
    name: "Malika Yusupova",
    archetype: "Kommunikator",
    role: "SMM menejer",
    skills: ["Kontent", "Targeting", "Analitika"],
    score: 85,
    district: "Mirzo Ulug'bek",
    verified: true,
    experience: "5 yil tajriba",
    about:
      "Brendlar uchun ijtimoiy tarmoq strategiyasini quradi. 3 ta akkauntni 100k+ obunachigacha o'stirgan.",
    rate: "7 500 000 so'm/oy",
    tone: "green",
    premium: false,
  },
  {
    id: "sardor",
    name: "Sardor Aliyev",
    archetype: "Tahlilchi-injener",
    role: "Backend dasturchi",
    skills: ["Node.js", "PostgreSQL", "AWS"],
    score: 90,
    district: "Chilonzor",
    verified: true,
    experience: "6 yil tajriba",
    about:
      "Yuqori yuklamali backend tizimlar arxitektori. To'lov va logistika platformalarida ishlagan.",
    rate: "15 000 000 so'm/oy",
    tone: "purple",
    premium: true,
  },
  {
    id: "nigora",
    name: "Nigora Rasulova",
    archetype: "Strateg-quruvchi",
    role: "Loyiha menejeri",
    skills: ["Agile", "Jira", "Jamoa"],
    score: 87,
    district: "Yunusobod",
    verified: true,
    experience: "5 yil tajriba",
    about:
      "Mahsulot va texnik jamoalarni boshqaradi. Bir vaqtda 4 ta loyihani muvaffaqiyatli yetkazgan.",
    rate: "11 000 000 so'm/oy",
    tone: "orange",
    premium: true,
  },
  {
    id: "bekzod",
    name: "Bekzod Ergashev",
    archetype: "Kashfiyotchi",
    role: "Mobil dasturchi",
    skills: ["Flutter", "Dart", "Firebase"],
    score: 83,
    district: "Sergeli",
    verified: true,
    experience: "2 yil tajriba",
    about:
      "Cross-platform mobil ilovalar quruvchi. App Store va Play Market'da 5 ta ilova chiqargan.",
    rate: "8 500 000 so'm/oy",
    tone: "blue",
    premium: true,
  },
];

export const ZONES: Zone[] = [
  { id: "chilonzor", district: "Chilonzor", count: 5, x: 30, y: 62 },
  { id: "yunusobod", district: "Yunusobod", count: 4, x: 58, y: 30 },
  { id: "mirzo", district: "Mirzo Ulug'bek", count: 3, x: 74, y: 55 },
  { id: "sergeli", district: "Sergeli", count: 2, x: 40, y: 84 },
  { id: "yashnobod", district: "Yashnobod", count: 2, x: 80, y: 78 },
];

export const CONVERSATIONS: Conversation[] = [
  {
    candidateId: "dilnoza",
    messages: [
      {
        id: "m1",
        from: "them",
        text: "Assalomu alaykum! So'rovingiz uchun rahmat.",
        time: "10:24",
      },
      {
        id: "m2",
        from: "me",
        text: "Va alaykum assalom, Dilnoza. Portfoliongiz juda kuchli. Suhbatga vaqtingiz bormi?",
        time: "10:26",
      },
      {
        id: "m3",
        from: "them",
        text: "Albatta, ertaga soat 15:00 qulaymi?",
        time: "10:28",
      },
    ],
  },
];

export const APPLICATIONS: BoardItem[] = [
  { candidateId: "dilnoza", note: "Product dizayner vakansiyasiga", time: "Bugun" },
  { candidateId: "malika", note: "SMM menejer vakansiyasiga", time: "Kecha" },
];

export const INTERVIEWS: BoardItem[] = [
  { candidateId: "dilnoza", note: "Suhbat · ertaga 15:00", time: "Rejalashtirilgan" },
];

export const SENT: BoardItem[] = [
  { candidateId: "jasur", note: "So'rov yuborildi", time: "2 kun oldin" },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Yangi javob",
    body: "Dilnoza Karimova so'rovingizni qabul qildi.",
    time: "5 daqiqa oldin",
    kind: "message",
    unread: true,
  },
  {
    id: "n2",
    title: "Yangi nomzod",
    body: "Chilonzor tumanida profilingizga mos yangi nomzod paydo bo'ldi.",
    time: "1 soat oldin",
    kind: "application",
    unread: true,
  },
  {
    id: "n3",
    title: "Obuna eslatmasi",
    body: "Premium nomzodlarni ochish uchun obunani faollashtiring.",
    time: "Kecha",
    kind: "system",
    unread: false,
  },
];

export const COMPANY = {
  name: "Innova Tech",
  tagline: "Raqamli mahsulotlar studiyasi",
  district: "Toshkent · Yunusobod",
  about:
    "Biz startaplar va korxonalar uchun veb hamda mobil mahsulotlar quramiz. Jamoamiz 24 kishidan iborat.",
  stats: { vacancies: 3, hired: 12, rating: 4.8 },
  vacancies: [
    { id: "v1", title: "Senior Frontend dasturchi", type: "To'liq stavka", district: "Yunusobod", active: true },
    { id: "v2", title: "Product dizayner", type: "To'liq stavka", district: "Masofaviy", active: true },
    { id: "v3", title: "SMM menejer", type: "Yarim stavka", district: "Chilonzor", active: false },
  ],
};

export function candidateById(id: string): Candidate | undefined {
  return CANDIDATES.find((c) => c.id === id);
}
