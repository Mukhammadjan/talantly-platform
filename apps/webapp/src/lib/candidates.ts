import type { CandidateView } from "@talantly/shared/talent-view";

export type { CandidateView };

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
