import type { CandidateView } from "@talantly/shared/talent-view";
import { authedFetch } from "./auth";

export type { CandidateView };

export interface CandidateContact {
  username: string | null;
  fullName: string | null;
  portfolioUrl: string | null;
}

export interface CandidateDetailAuthed {
  candidate: CandidateView;
  contactUnlocked: boolean;
  contact: CandidateContact | null;
}

/** Kirgan izlovchi uchun nomzod detali — kontakt holati bilan. */
export async function fetchCandidateAuthed(
  id: string,
): Promise<CandidateDetailAuthed | null> {
  try {
    const res = await authedFetch(`/api/talent/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as CandidateDetailAuthed;
  } catch {
    return null;
  }
}

export interface UnlockResult {
  ok: boolean;
  status: number;
  unlockStatus?: string;
  amount?: number;
  error?: string;
}

/** Kontaktni ochish so'rovi. obuna → tasdiqlangan, aks holda kutilmoqda + narx. */
export async function unlockContact(talentId: string): Promise<UnlockResult> {
  try {
    const res = await authedFetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talentId }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      status?: string;
      amount?: number;
      error?: string;
    };
    return {
      ok: res.ok,
      status: res.status,
      unlockStatus: data.status,
      amount: data.amount,
      error: data.error,
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

export interface CandidateFilters {
  direction?: string | null;
  level?: string | null;
  minSalary?: number | null;
  search?: string | null;
  sort?: "score" | "recent" | "salary";
}

export async function fetchCandidates(
  filters: CandidateFilters = {},
): Promise<CandidateView[]> {
  const p = new URLSearchParams();
  if (filters.direction) p.set("direction", filters.direction);
  if (filters.level) p.set("level", filters.level);
  if (filters.minSalary) p.set("minSalary", String(filters.minSalary));
  if (filters.search) p.set("search", filters.search);
  if (filters.sort) p.set("sort", filters.sort);
  const qs = p.toString();
  try {
    const res = await fetch(`/api/public/candidates${qs ? `?${qs}` : ""}`);
    if (!res.ok) return [];
    const d = (await res.json()) as { candidates: CandidateView[] };
    return d.candidates ?? [];
  } catch {
    return [];
  }
}

export async function fetchCandidate(id: string): Promise<CandidateView | null> {
  try {
    const res = await fetch(`/api/public/candidates/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const d = (await res.json()) as { candidate: CandidateView };
    return d.candidate ?? null;
  } catch {
    return null;
  }
}
