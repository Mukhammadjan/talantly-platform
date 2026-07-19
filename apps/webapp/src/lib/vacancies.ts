import { authedFetch } from "./auth";
import type { MatchProfile, MatchVacancy } from "./match";

// Vakansiya adapteri — ochiq API'dan typed view'ga. Backend tayyor;
// komponentlar shu view/profildan uzatiladi (UI DB'ni bilmaydi).

export interface VacancyView {
  id: string;
  company: string;
  verified: boolean;
  logoUrl: string | null;
  companyActivity?: string | null;
  companyAbout?: string | null;
  title: string;
  direction: string;
  level: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  salaryCurrency: string;
  city: string;
  district: string;
  workFormats: string[];
  description: string[];
  createdAt: string;
}

export interface VacancyFilters {
  direction?: string | null;
  level?: string | null;
  workFormat?: string | null;
  minSalary?: number | null;
  search?: string | null;
  sort?: "recent" | "salary";
}

/** VacancyView → match modeli (title + talablar matni ko'nikma uchun). */
export function toMatchVacancy(v: VacancyView): MatchVacancy {
  return {
    direction: v.direction,
    level: v.level,
    salaryFrom: v.salaryFrom ?? 0,
    salaryTo: v.salaryTo,
    requirements: v.description,
    title: v.title,
  };
}

export async function fetchVacancies(
  filters: VacancyFilters = {},
): Promise<VacancyView[]> {
  const p = new URLSearchParams();
  if (filters.direction) p.set("direction", filters.direction);
  if (filters.level) p.set("level", filters.level);
  if (filters.workFormat) p.set("workFormat", filters.workFormat);
  if (filters.minSalary) p.set("minSalary", String(filters.minSalary));
  if (filters.search) p.set("search", filters.search);
  if (filters.sort) p.set("sort", filters.sort);
  const qs = p.toString();
  try {
    const res = await fetch(`/api/public/vacancies${qs ? `?${qs}` : ""}`);
    if (!res.ok) return [];
    const d = (await res.json()) as { vacancies: VacancyView[] };
    return d.vacancies ?? [];
  } catch {
    return [];
  }
}

export async function fetchVacancy(
  id: string,
): Promise<{ vacancy: VacancyView; recommendations: VacancyView[] } | null> {
  try {
    const res = await fetch(`/api/public/vacancies/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as {
      vacancy: VacancyView;
      recommendations: VacancyView[];
    };
  } catch {
    return null;
  }
}

/** Kirgan talant profili (match uchun). Guest → null. */
export async function fetchMatchProfile(): Promise<MatchProfile | null> {
  try {
    const res = await authedFetch("/api/me");
    if (!res.ok) return null;
    const snap = (await res.json()) as {
      profile?: {
        direction?: string | null;
        level?: string | null;
        skills?: string[];
        salaryFrom?: number | null;
      };
    };
    const pr = snap.profile;
    if (!pr || !pr.direction) return null;
    return {
      direction: pr.direction,
      level: pr.level ?? "intern",
      skills: pr.skills ?? [],
      salaryFrom: pr.salaryFrom ?? null,
    };
  } catch {
    return null;
  }
}
