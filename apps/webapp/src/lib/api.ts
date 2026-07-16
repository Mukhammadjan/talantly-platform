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

  // Vakansiyalar — Run 2'da real /api/vacancies ga ulanadi.
  getVacancies(): Promise<Vacancy[]> {
    return delay(VACANCIES);
  },
  getVacancy(id: string): Promise<Vacancy | null> {
    return delay(VACANCIES.find((v) => v.id === id) ?? null);
  },

  getApplications(): Promise<Application[]> {
    return delay(APPLICATIONS);
  },
  getCandidates(): Promise<Candidate[]> {
    return delay(CANDIDATES);
  },
  getCandidate(id: string): Promise<Candidate | null> {
    return delay(CANDIDATES.find((c) => c.id === id) ?? null);
  },
  getZones(): Promise<Zone[]> {
    return delay(ZONES);
  },
};
