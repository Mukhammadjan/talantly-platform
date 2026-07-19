// AI-Match hisobi — bizning vaznlar (prompt §6). UI'da EMAS, shu yerda.
// Faktor vaznlari: yo'nalish 40 · ko'nikma 25 · daraja 20 · oylik 15 (jami 100).

export interface MatchProfile {
  direction: string;
  level: string; // "intern" | "mutaxassis"
  skills: string[];
  salaryFrom: number | null; // kutilayotgan minimal oylik
}

export interface MatchVacancy {
  direction: string;
  level: string; // "intern" | "mutaxassis" | "ikkalasi"
  salaryFrom: number;
  salaryTo: number | null;
  requirements: string[];
  title: string;
}

export interface MatchFactor {
  key: "direction" | "skills" | "level" | "salary";
  label: string;
  value: string; // qisqa holat matni ("Mos", "Qisman", ...)
  weightMax: number;
  contribution: number;
}

export interface MatchImprovement {
  title: string;
  text: string;
}

export interface MatchResult {
  percent: number;
  verdict: string;
  summary: string;
  factors: MatchFactor[];
  improvements: MatchImprovement[];
}

const WEIGHTS = { direction: 40, skills: 25, level: 20, salary: 15 } as const;

const LEVEL_RANK: Record<string, number> = { intern: 0, mutaxassis: 1 };

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-zа-я0-9']+/gi, " ").trim();
}

/** Ko'nikma ulushi: talant ko'nikmalari vakansiya matnida (unvon+talablar)
 *  qanchalik uchraydi. Ko'nikma yo'q bo'lsa — yo'nalishga tayanib qisman. */
function skillScore(profile: MatchProfile, vacancy: MatchVacancy): number {
  const skills = profile.skills.filter(Boolean);
  const haystack = norm(
    [vacancy.title, ...(vacancy.requirements ?? [])].join(" "),
  );
  if (skills.length === 0) {
    // Ma'lumot yetarli emas — yo'nalish mosligiga qarab o'rtacha baho.
    return profile.direction === vacancy.direction ? 0.6 : 0.3;
  }
  const hit = skills.filter((s) => haystack.includes(norm(s))).length;
  return hit / skills.length;
}

/** Oylik mosligi: talant kutgan minimal vakansiya oralig'iga tushsa to'liq. */
function salaryScore(profile: MatchProfile, vacancy: MatchVacancy): number {
  const want = profile.salaryFrom;
  if (!want) return 0.7; // kutilma ko'rsatilmagan — neytral
  const max = vacancy.salaryTo ?? vacancy.salaryFrom;
  if (want <= max) return 1; // vakansiya kutilmani qoplaydi
  // Talant kutgani vakansiya shiftidan yuqori — qanchalik yuqoriligiga qarab.
  const gap = (want - max) / max;
  return Math.max(0, 1 - gap);
}

function levelScore(profile: MatchProfile, vacancy: MatchVacancy): number {
  if (vacancy.level === "ikkalasi") return 1;
  const a = LEVEL_RANK[profile.level] ?? 0;
  const b = LEVEL_RANK[vacancy.level] ?? 0;
  const diff = Math.abs(a - b);
  return diff === 0 ? 1 : diff === 1 ? 0.5 : 0;
}

function verdictFor(percent: number): string {
  if (percent >= 85) return "Ajoyib moslik";
  if (percent >= 70) return "Yaxshi moslik";
  if (percent >= 50) return "O'rtacha moslik";
  return "Past moslik";
}

/**
 * Talant profili + vakansiya → moslik natijasi.
 * Guest (profil yo'q) → null: UI "kiring" holatini ko'rsatadi.
 */
export function computeMatch(
  profile: MatchProfile | null,
  vacancy: MatchVacancy,
): MatchResult | null {
  if (!profile) return null;

  const ratios = {
    direction: profile.direction === vacancy.direction ? 1 : 0,
    skills: skillScore(profile, vacancy),
    level: levelScore(profile, vacancy),
    salary: salaryScore(profile, vacancy),
  };

  const round = (n: number): number => Math.round(n);
  const contrib = {
    direction: round(ratios.direction * WEIGHTS.direction),
    skills: round(ratios.skills * WEIGHTS.skills),
    level: round(ratios.level * WEIGHTS.level),
    salary: round(ratios.salary * WEIGHTS.salary),
  };
  const percent =
    contrib.direction + contrib.skills + contrib.level + contrib.salary;

  const factors: MatchFactor[] = [
    {
      key: "direction",
      label: "Yo'nalish",
      value: ratios.direction === 1 ? "To'liq mos" : "Mos emas",
      weightMax: WEIGHTS.direction,
      contribution: contrib.direction,
    },
    {
      key: "skills",
      label: "Ko'nikmalar",
      value:
        ratios.skills >= 0.75
          ? "Kuchli"
          : ratios.skills >= 0.4
            ? "Qisman"
            : "Zaif",
      weightMax: WEIGHTS.skills,
      contribution: contrib.skills,
    },
    {
      key: "level",
      label: "Daraja",
      value:
        ratios.level === 1 ? "Mos" : ratios.level > 0 ? "Yaqin" : "Farqli",
      weightMax: WEIGHTS.level,
      contribution: contrib.level,
    },
    {
      key: "salary",
      label: "Oylik kutilmasi",
      value:
        ratios.salary >= 0.9 ? "Mos" : ratios.salary >= 0.5 ? "Qisman" : "Yuqori",
      weightMax: WEIGHTS.salary,
      contribution: contrib.salary,
    },
  ];

  // Eng past ikki faktor bo'yicha yaxshilanish takliflari.
  const gaps = factors
    .map((f) => ({ f, gap: f.weightMax - f.contribution }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 2);

  const IMPROVE: Record<MatchFactor["key"], MatchImprovement> = {
    direction: {
      title: "Yo'nalishni moslang",
      text: "Bu vakansiya boshqa yo'nalish uchun — o'z yo'nalishingizdagi vakansiyalar mosligi yuqori bo'ladi.",
    },
    skills: {
      title: "Ko'nikmalarni kuchaytiring",
      text: "Vakansiya talab qilgan ko'nikmalarni profilingizga qo'shing va tegishli testdan yuqori ball to'plang.",
    },
    level: {
      title: "Darajangizni oshiring",
      text: "Tajriba va tekshiruvni yakunlab, mutaxassis darajasiga o'ting — mos vakansiyalar ko'payadi.",
    },
    salary: {
      title: "Oylik kutilmasini ko'rib chiqing",
      text: "Kutilayotgan oylikni bozorga moslasangiz, mos takliflar doirasi kengayadi.",
    },
  };
  const improvements = gaps.map((g) => IMPROVE[g.f.key]);

  return {
    percent,
    verdict: verdictFor(percent),
    summary:
      percent >= 70
        ? "Profilingiz bu vakansiyaga yaxshi mos keladi."
        : "Ba'zi mezonlarni yaxshilasangiz, moslik oshadi.",
    factors,
    improvements,
  };
}
