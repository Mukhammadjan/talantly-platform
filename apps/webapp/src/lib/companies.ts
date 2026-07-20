// Kompaniya adapteri — ochiq API'dan typed view'ga (UI DB'ni bilmaydi).

export interface CompanyView {
  id: string;
  name: string;
  verified: boolean;
  logoUrl: string | null;
  activity: string;
  city: string;
  district: string;
  about: string;
  directions: string[];
  openVacancies: number;
}

export interface CompanyVacancy {
  id: string;
  title: string;
  direction: string;
  level: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  city: string;
  district: string;
  workFormats: string[];
  createdAt: string;
}

export interface CompanyDetail {
  id: string;
  name: string;
  verified: boolean;
  logoUrl: string | null;
  activity: string;
  city: string;
  district: string;
  about: string;
  directions: string[];
  neededLevel: string;
}

export interface CompanyFilters {
  direction?: string | null;
  search?: string | null;
}

export async function fetchCompanies(
  filters: CompanyFilters = {},
): Promise<CompanyView[]> {
  const p = new URLSearchParams();
  if (filters.direction) p.set("direction", filters.direction);
  if (filters.search) p.set("search", filters.search);
  const qs = p.toString();
  try {
    const res = await fetch(`/api/public/companies${qs ? `?${qs}` : ""}`);
    if (!res.ok) return [];
    const d = (await res.json()) as { companies: CompanyView[] };
    return d.companies ?? [];
  } catch {
    return [];
  }
}

export async function fetchCompany(
  id: string,
): Promise<{ company: CompanyDetail; vacancies: CompanyVacancy[] } | null> {
  try {
    const res = await fetch(`/api/public/companies/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as {
      company: CompanyDetail;
      vacancies: CompanyVacancy[];
    };
  } catch {
    return null;
  }
}
