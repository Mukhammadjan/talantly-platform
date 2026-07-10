import type { CvExperienceItem, Direction } from "../types.js";

export interface CvInput {
  fullName: string;
  birthYear: number;
  city: string;
  direction: Direction;
  education: string;
  freeText: string;
  portfolioUrl: string | null;
}

export interface CvJson {
  summary: string;
  skills: string[];
  experience: CvExperienceItem[];
  aiVerdict: string;
}

interface DirectionProfile {
  roleNoun: string;
  baseSkills: string[];
  keywordSkills: Record<string, string>;
  learningBullets: string[];
  verdictStrength: string[];
}

const DIRECTION_PROFILES: Record<Direction, DirectionProfile> = {
  dasturlash: {
    roleNoun: "boshlang'ich dasturchi",
    baseSkills: ["Algoritmik fikrlash", "Muammolarni mustaqil yechish"],
    keywordSkills: {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      java: "Java",
      "c++": "C++",
      "c#": "C#",
      php: "PHP",
      html: "HTML",
      css: "CSS",
      react: "React",
      vue: "Vue.js",
      angular: "Angular",
      node: "Node.js",
      sql: "SQL",
      git: "Git",
      docker: "Docker",
      flutter: "Flutter",
      swift: "Swift",
      kotlin: "Kotlin",
      django: "Django",
      laravel: "Laravel",
      bot: "Telegram botlar",
      backend: "Backend dasturlash",
      frontend: "Frontend dasturlash",
    },
    learningBullets: [
      "Dasturlash asoslarini mustaqil va kurslar orqali o'zlashtirgan",
      "Kichik loyihalar ustida amaliyot qilgan",
      "Yangi texnologiyalarni tez o'zlashtiradi",
    ],
    verdictStrength: [
      "texnik poydevori boshlang'ich bosqich uchun yetarli",
      "mantiqiy fikrlashi va o'rganishga ochiqligi ko'zga tashlanadi",
      "amaliy mashg'ulotlarga jiddiy yondashgani seziladi",
    ],
  },
  dizayn: {
    roleNoun: "yosh dizayner",
    baseSkills: ["Vizual kompozitsiya", "Rang va tipografiya tuyg'usi"],
    keywordSkills: {
      figma: "Figma",
      photoshop: "Adobe Photoshop",
      illustrator: "Adobe Illustrator",
      "after effects": "After Effects",
      canva: "Canva",
      ui: "UI dizayn",
      ux: "UX tadqiqot",
      logo: "Logo va brend dizayni",
      "3d": "3D grafika",
      blender: "Blender",
      banner: "Banner dizayni",
      mobil: "Mobil interfeys dizayni",
    },
    learningBullets: [
      "Dizayn tamoyillarini amaliy loyihalarda qo'llagan",
      "Turli uslubdagi ishlar ustida mashq qilgan",
      "Mijoz ehtiyojini vizual yechimga aylantira oladi",
    ],
    verdictStrength: [
      "vizual didi va uslubga e'tibori yaxshi shakllangan",
      "kompozitsiya tuyg'usi boshlang'ich daraja uchun kuchli",
      "ijodiy yondashuvi va o'sishga intilishi seziladi",
    ],
  },
  marketing: {
    roleNoun: "marketing yo'nalishidagi yosh mutaxassis",
    baseSkills: ["Kontent strategiya", "Auditoriya tahlili"],
    keywordSkills: {
      smm: "SMM",
      instagram: "Instagram marketing",
      telegram: "Telegram kanallar yuritish",
      kontent: "Kontent yaratish",
      copywrit: "Kopirayting",
      target: "Targetlangan reklama",
      "google ads": "Google Ads",
      seo: "SEO",
      analitika: "Marketing analitika",
      brend: "Brend kommunikatsiya",
      video: "Video kontent",
    },
    learningBullets: [
      "Ijtimoiy tarmoqlarda kontent yuritish tajribasiga ega",
      "Auditoriya qiziqishlarini o'rganib, kontent moslashtiradi",
      "Marketing asoslari bo'yicha bilimlarini amalda sinagan",
    ],
    verdictStrength: [
      "zamonaviy raqamli kanallarni yaxshi his qiladi",
      "kontentga ijodiy va tizimli yondashadi",
      "kommunikatsiya ko'nikmalari kuchli",
    ],
  },
  sotuv: {
    roleNoun: "sotuv yo'nalishidagi yosh mutaxassis",
    baseSkills: ["Mijozlar bilan muloqot", "Muzokara olib borish"],
    keywordSkills: {
      crm: "CRM tizimlar",
      b2b: "B2B sotuv",
      telefon: "Telefon orqali sotuv",
      mijoz: "Mijozlar bilan ishlash",
      savdo: "Savdo jarayonlari",
      prezentatsiya: "Mahsulot taqdimoti",
    },
    learningBullets: [
      "Mijozlar bilan bevosita muloqot tajribasiga ega",
      "Ehtiyojni aniqlab, mos yechim taklif qila oladi",
      "Rad javoblardan tushkunlikka tushmaydi",
    ],
    verdictStrength: [
      "muloqot ko'nikmalari va ishonch hosil qilish qobiliyati yaxshi",
      "natijaga yo'naltirilgan yondashuvi seziladi",
      "mijoz ehtiyojini tez ilg'aydi",
    ],
  },
  data: {
    roleNoun: "ma'lumotlar tahlili bilan shug'ullanuvchi yosh mutaxassis",
    baseSkills: ["Ma'lumotlarni tahlil qilish", "Statistik fikrlash"],
    keywordSkills: {
      excel: "Excel",
      sql: "SQL",
      python: "Python",
      pandas: "Pandas",
      "power bi": "Power BI",
      tableau: "Tableau",
      statistika: "Statistika",
      vizual: "Ma'lumotlarni vizuallashtirish",
    },
    learningBullets: [
      "Ma'lumotlar bilan ishlash asoslarini o'zlashtirgan",
      "Raqamlar ortidagi xulosalarni topishga qiziqadi",
      "Tahliliy hisobotlar tuzishni mashq qilgan",
    ],
    verdictStrength: [
      "tahliliy fikrlashi boshlang'ich daraja uchun kuchli",
      "aniqlik va detallarga e'tibori yuqori",
      "ma'lumot asosida xulosa chiqarishga intiladi",
    ],
  },
  boshqa: {
    roleNoun: "ko'p qirrali yosh mutaxassis",
    baseSkills: ["Tez o'rganish", "Moslashuvchanlik"],
    keywordSkills: {
      excel: "Excel",
      ingliz: "Ingliz tili",
      rus: "Rus tili",
      kompyuter: "Kompyuter savodxonligi",
      loyiha: "Loyihalarda ishtirok",
    },
    learningBullets: [
      "Turli sohalarda o'z kuchini sinab ko'rgan",
      "Yangi vazifalarni tez o'zlashtiradi",
      "Berilgan ishga mas'uliyat bilan yondashadi",
    ],
    verdictStrength: [
      "o'rganishga ochiqligi va mas'uliyati ko'zga tashlanadi",
      "turli vazifalarga moslasha olishi qimmatli",
      "ish jarayoniga jiddiy yondashadi",
    ],
  },
};

const SOFT_SKILLS = [
  "Jamoada ishlash",
  "Mas'uliyatlilik",
  "Tashabbuskorlik",
  "Punktuallik",
];

const SUMMARY_CLOSERS = [
  "Endi bilimlarini haqiqiy loyihalarda qo'llashga tayyor.",
  "Amaliyot orqali professional darajaga chiqishni maqsad qilgan.",
  "Jamoada ishlab, real tajriba orttirishga intiladi.",
];

const VERDICT_OPENERS = [
  "Nomzod",
  "Profil tahlili shuni ko'rsatadiki, nomzod",
  "Berilgan ma'lumotlarga ko'ra, nomzod",
];

const VERDICT_CLOSERS = [
  "Motivatsiyasi yuqori — amaliyotga tavsiya etiladi.",
  "Boshlang'ich pozitsiyalar uchun mos nomzod sifatida tavsiya etiladi.",
  "To'g'ri yo'naltirilsa, tez o'sish potensialiga ega.",
];

function hashSeed(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function pick<T>(options: readonly T[], seed: number, salt: number): T {
  const index = (seed + salt) % options.length;
  return options[index] as T;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}

function extractSkills(input: CvInput, profile: DirectionProfile): string[] {
  let haystack =
    `${input.freeText} ${input.education} ${input.portfolioUrl ?? ""}`.toLowerCase();
  const found: string[] = [];
  // Longest keywords first + consume matches, so "javascript" never also
  // yields "java". A match must start at a word boundary ("ui" must not hit
  // the middle of an unrelated word), but may extend into Uzbek suffixes
  // ("botlar", "kontentni").
  const entries = Object.entries(profile.keywordSkills).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [keyword, label] of entries) {
    let idx = haystack.indexOf(keyword);
    while (idx > 0 && /[a-z0-9]/.test(haystack[idx - 1] ?? "")) {
      idx = haystack.indexOf(keyword, idx + 1);
    }
    if (idx !== -1 && !found.includes(label)) {
      found.push(label);
      haystack =
        haystack.slice(0, idx) + " " + haystack.slice(idx + keyword.length);
    }
  }
  const seed = hashSeed(input.fullName);
  const soft = pick(SOFT_SKILLS, seed, 7);
  const skills = [...profile.baseSkills, ...found.slice(0, 6), soft];
  return [...new Set(skills)].slice(0, 9);
}

function buildSummary(
  input: CvInput,
  profile: DirectionProfile,
  skills: string[],
): string {
  const seed = hashSeed(input.fullName);
  const name = firstName(input.fullName);
  const age = new Date().getFullYear() - input.birthYear;

  const opener =
    (seed + 3) % 2 === 0
      ? `${name} — ${input.city}dan bo'lgan ${age} yoshli ${profile.roleNoun}.`
      : `${age} yoshli ${name} ${input.city} shahridan, ${profile.roleNoun} sifatida o'z yo'lini boshlamoqda.`;

  const education = `Ta'limi: ${input.education}.`;

  const skillPair = skills.slice(0, 2).join(" va ").toLowerCase();
  const middle = `Hozirda ${skillPair} bo'yicha amaliy ko'nikmalarini mustahkamlamoqda.`;

  const portfolio = input.portfolioUrl
    ? "Ishlari bilan portfoliosida tanishish mumkin."
    : null;

  const closer = pick(SUMMARY_CLOSERS, seed, 11);

  return [opener, education, middle, portfolio, closer]
    .filter(Boolean)
    .join(" ");
}

function buildExperience(
  input: CvInput,
  profile: DirectionProfile,
): CvExperienceItem[] {
  const seed = hashSeed(input.fullName);
  const items: CvExperienceItem[] = [
    {
      title: "Ta'lim",
      org: input.education,
      period: "Asosiy tayyorgarlik",
      bullets: [
        pick(profile.learningBullets, seed, 1),
        pick(profile.learningBullets, seed, 2),
      ].filter((b, i, arr) => arr.indexOf(b) === i),
    },
  ];

  if (input.portfolioUrl) {
    items.push({
      title: "Portfolio loyihalari",
      org: input.portfolioUrl,
      period: "Mustaqil ishlar",
      bullets: [
        "O'z loyihalari ustida mustaqil ishlagan",
        "Natijalarini portfolio sifatida jamlagan",
      ],
    });
  }

  const mentionsProject = /loyiha|proyekt|ishla[gb]/i.test(input.freeText);
  items.push({
    title: "Mustaqil o'rganish va amaliyot",
    org: "O'z ustida ishlash",
    period: "Doimiy",
    bullets: [
      mentionsProject
        ? "Amaliy loyihalar orqali bilimlarini chuqurlashtirgan"
        : pick(profile.learningBullets, seed, 4),
      "Sohadagi yangiliklarni kuzatib boradi",
    ],
  });

  return items;
}

function buildVerdict(input: CvInput, profile: DirectionProfile): string {
  const seed = hashSeed(input.fullName);
  const opener = pick(VERDICT_OPENERS, seed, 5);
  const strength = pick(profile.verdictStrength, seed, 9);
  const portfolioNote = input.portfolioUrl
    ? " Portfoliosi mavjudligi ishga jiddiy yondashuvidan dalolat beradi."
    : "";
  const closer = pick(VERDICT_CLOSERS, seed, 13);
  return `${opener} ${strength}.${portfolioNote} ${closer}`;
}

/**
 * Deterministic template-based CV generator (demo mode). Same signature a
 * real LLM-backed generator will implement later.
 */
export function generateCv(input: CvInput): CvJson {
  const profile = DIRECTION_PROFILES[input.direction];
  const skills = extractSkills(input, profile);
  return {
    summary: buildSummary(input, profile, skills),
    skills,
    experience: buildExperience(input, profile),
    aiVerdict: buildVerdict(input, profile),
  };
}
