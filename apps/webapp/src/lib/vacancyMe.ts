// Ish beruvchining o'z vakansiyalari — API bilan client o'rtasidagi adapter.

import { authedFetch } from "./auth";

export type VacancyStatus = "faol" | "yopilgan" | "qoralama";

export interface MyVacancy {
  id: string;
  title: string;
  direction: string;
  level: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  city: string;
  district: string;
  workFormats: string[];
  status: VacancyStatus;
  createdAt: string;
  applications: { total: number; fresh: number };
}

export interface VacancyDraft {
  title: string;
  direction: string;
  level: string;
  salaryFrom: number | null;
  salaryTo: number | null;
  city: string;
  district: string;
  workFormats: string[];
  description: string;
}

export interface VacancyDetail extends VacancyDraft {
  id: string;
  status: VacancyStatus;
  createdAt: string;
}

export interface Application {
  id: string;
  status: "yangi" | "korildi" | "boglanildi" | "yopildi";
  note: string;
  createdAt: string;
  talent: {
    id: string;
    name: string;
    direction: string;
    city: string;
    verified: boolean;
  };
}

export async function fetchMyVacancies(): Promise<MyVacancy[] | null> {
  try {
    const res = await authedFetch("/api/vacancies?mine=1");
    if (!res.ok) return null;
    const d = (await res.json()) as { vacancies: MyVacancy[] };
    return d.vacancies ?? [];
  } catch {
    return null;
  }
}

export async function fetchMyVacancy(id: string): Promise<VacancyDetail | null> {
  try {
    const res = await authedFetch(`/api/vacancies/${id}`);
    if (!res.ok) return null;
    const d = (await res.json()) as { vacancy: VacancyDetail };
    return d.vacancy ?? null;
  } catch {
    return null;
  }
}

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createVacancy(draft: VacancyDraft): Promise<SaveResult> {
  try {
    const res = await authedFetch("/api/vacancies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const d = (await res.json()) as { id?: string; error?: string };
    if (!res.ok) return { ok: false, error: d.error ?? "xato" };
    return { ok: true, id: d.id ?? "" };
  } catch {
    return { ok: false, error: "tarmoq" };
  }
}

export async function updateVacancy(
  id: string,
  patch: Partial<VacancyDraft> & { status?: VacancyStatus },
): Promise<SaveResult> {
  try {
    const res = await authedFetch(`/api/vacancies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const d = (await res.json()) as {
      vacancy?: { id: string };
      error?: string;
    };
    if (!res.ok) return { ok: false, error: d.error ?? "xato" };
    return { ok: true, id: d.vacancy?.id ?? id };
  } catch {
    return { ok: false, error: "tarmoq" };
  }
}

export async function fetchApplications(
  vacancyId: string,
): Promise<Application[] | null> {
  try {
    const res = await authedFetch(`/api/vacancies/${vacancyId}/arizalar`);
    if (!res.ok) return null;
    const d = (await res.json()) as { applications: Application[] };
    return d.applications ?? [];
  } catch {
    return null;
  }
}

export async function setApplicationStatus(
  id: string,
  status: Application["status"],
): Promise<boolean> {
  try {
    const res = await authedFetch("/api/request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
