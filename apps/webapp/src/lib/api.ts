// Typed frontend interfeys. Telegram ichida REAL backend (v2 Supabase, JWT);
// tashqarida yoki xato bo'lsa mock'ka tushadi — imzolar o'zgarmaydi.

import { authedFetch, hasSession } from "@/lib/auth";
import { APPLICATIONS, CANDIDATES, TALENT, VACANCIES, ZONES } from "@/mock/data";
import {
  PERSONALITY_QUESTIONS,
  SKILL_QUESTIONS,
  type Question,
} from "@/mock/quiz";
import type {
  Application,
  Candidate,
  TalentSnapshot,
  Vacancy,
  Zone,
} from "@/lib/types";

export interface ApiSlot {
  id: string;
  startsAt: string;
}

function delay<T>(value: T, ms = 320): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    if (!(await hasSession())) return null;
    const res = await authedFetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const api = {
  async getTalent(): Promise<TalentSnapshot> {
    const real = await getJson<TalentSnapshot>("/api/me");
    return real ?? delay(TALENT);
  },

  async saveTalentProfile(
    profile: Partial<TalentSnapshot["profile"]>,
  ): Promise<TalentSnapshot | null> {
    try {
      if (!(await hasSession())) return null;
      const res = await authedFetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) return null;
      return (await res.json()) as TalentSnapshot;
    } catch {
      return null;
    }
  },

  async getPersonalityQuestions(): Promise<Question[]> {
    const real = await getJson<{ questions: Question[] }>(
      "/api/questions?kind=personality",
    );
    return real?.questions?.length ? real.questions : delay(PERSONALITY_QUESTIONS);
  },

  async getSkillQuestions(): Promise<Question[]> {
    const real = await getJson<{ questions: Question[] }>(
      "/api/questions?kind=skill",
    );
    return real?.questions?.length ? real.questions : delay(SKILL_QUESTIONS);
  },

  /** null = real backend yo'q (mock rejim). */
  async savePersonality(
    answers: number[],
  ): Promise<{ archetype: string } | null> {
    try {
      if (!(await hasSession())) return null;
      const res = await authedFetch("/api/personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) return null;
      return (await res.json()) as { archetype: string };
    } catch {
      return null;
    }
  },

  /** null = real backend yo'q (mock rejim). */
  async saveSkillTest(
    answers: number[],
  ): Promise<{ score: number; passed: boolean } | null> {
    try {
      if (!(await hasSession())) return null;
      const res = await authedFetch("/api/skill-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) return null;
      return (await res.json()) as { score: number; passed: boolean };
    } catch {
      return null;
    }
  },

  /** null = real backend yo'q; [] = slot qolmagan. */
  async getInterviewSlots(): Promise<ApiSlot[] | null> {
    const real = await getJson<{ slots: { id: string; starts_at: string }[] }>(
      "/api/slots",
    );
    if (!real) return null;
    return real.slots.map((s) => ({ id: s.id, startsAt: s.starts_at }));
  },

  async bookSlot(slotId: string): Promise<{ scheduledAt: string } | null> {
    try {
      if (!(await hasSession())) return null;
      const res = await authedFetch("/api/slots/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      });
      if (!res.ok) return null;
      return (await res.json()) as { scheduledAt: string };
    } catch {
      return null;
    }
  },

  // ---- Vakansiyalar (real /api/vacancies, mock fallback) ----
  async getVacancies(): Promise<Vacancy[]> {
    const real = await getJson<{ vacancies: Vacancy[] }>("/api/vacancies");
    return real ? real.vacancies : delay(VACANCIES);
  },
  async getVacancy(id: string): Promise<Vacancy | null> {
    const real = await getJson<{ vacancies: Vacancy[] }>(
      `/api/vacancies?id=${encodeURIComponent(id)}`,
    );
    if (real?.vacancies?.[0]) return real.vacancies[0];
    return delay(VACANCIES.find((v) => v.id === id) ?? null);
  },

  /** Vakansiyaga ariza (talant_qiziqishi). Mock rejimda ok=true. */
  async applyVacancy(
    vacancyId: string,
  ): Promise<{ ok: boolean; already?: boolean; demo?: boolean }> {
    try {
      if (!(await hasSession())) return { ok: true };
      const res = await authedFetch("/api/vacancies/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyId }),
      });
      if (res.ok) return { ok: true };
      if (res.status === 403) return { ok: false, demo: true };
      if (res.status === 409) {
        const b = (await res.json()) as { error?: string };
        if (b.error === "already_applied") return { ok: true, already: true };
      }
      return { ok: false };
    } catch {
      return { ok: false };
    }
  },

  /** Yangi vakansiya (izlovchi). Mock rejimda true. */
  async createVacancy(input: {
    title: string;
    direction: string;
    level: string;
    salaryFrom?: number;
    salaryTo?: number;
    workFormats: string[];
    description?: string;
  }): Promise<boolean> {
    try {
      if (!(await hasSession())) return true;
      const res = await authedFetch("/api/vacancies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** Kompaniya so'rovi. Demo profilga server 403 beradi. */
  async sendRequest(
    talentId: string,
    vacancyId?: string,
  ): Promise<{ ok: boolean; demo?: boolean }> {
    try {
      if (!(await hasSession())) return { ok: true };
      const res = await authedFetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talentId, vacancyId }),
      });
      if (res.ok) return { ok: true };
      if (res.status === 403) return { ok: false, demo: true };
      return { ok: false };
    } catch {
      return { ok: false };
    }
  },

  /** Kontakt ochish to'lovi (contact_unlocks, kutilmoqda). */
  async createUnlock(
    talentId: string,
    kind: "bir_martalik" | "obuna",
  ): Promise<boolean> {
    try {
      if (!(await hasSession())) return true;
      const res = await authedFetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talentId, kind }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /** saved_items toggle (real bo'lsa) — fire-and-forget. */
  async toggleSaveRemote(
    kind: "vacancy" | "talant" | "company",
    targetId: string,
  ): Promise<void> {
    try {
      if (!(await hasSession())) return;
      await authedFetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, targetId }),
      });
    } catch {
      /* saqlash statistikasi — jim yiqiladi */
    }
  },

  getApplications(): Promise<Application[]> {
    return delay(APPLICATIONS);
  },

  // ---- Izlovchi feed (real /api/feed, mock fallback) ----
  async getCandidates(): Promise<Candidate[]> {
    const real = await getJson<{ candidates: Candidate[] }>("/api/feed");
    return real ? real.candidates : delay(CANDIDATES);
  },
  async getCandidate(id: string): Promise<Candidate | null> {
    const real = await getJson<{ candidate: Candidate }>(
      `/api/talent/${encodeURIComponent(id)}`,
    );
    if (real?.candidate) return real.candidate;
    return delay(CANDIDATES.find((c) => c.id === id) ?? null);
  },
  getZones(): Promise<Zone[]> {
    return delay(ZONES);
  },
};
