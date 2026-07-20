import { authedFetch } from "./auth";

// Kirgan talant snapshot + arizalar (Kabinet uchun).

export interface MeProfile {
  fullName: string;
  city: string | null;
  district: string | null;
  direction: string | null;
  level: string | null;
  experienceYears: number | null;
  skills: string[];
  workFormats: string[];
  salaryFrom: number | null;
  about: string | null;
  portfolioUrl: string | null;
}

export interface MeSnapshot {
  status: string;
  score: number | null;
  archetype: string | null;
  interviewAt: string | null;
  cvReady: boolean;
  radReason: string | null;
  profile: MeProfile;
}

export interface Application {
  id: string;
  status: string;
  createdAt: string;
  vacancyId: string | null;
  vacancyTitle: string;
  company: string;
  logoUrl: string | null;
  verified: boolean;
}

export async function fetchMe(): Promise<MeSnapshot | null> {
  try {
    const res = await authedFetch("/api/me");
    if (!res.ok) return null;
    return (await res.json()) as MeSnapshot;
  } catch {
    return null;
  }
}

export async function fetchApplications(): Promise<Application[]> {
  try {
    const res = await authedFetch("/api/me/applications");
    if (!res.ok) return [];
    const d = (await res.json()) as { applications: Application[] };
    return d.applications ?? [];
  } catch {
    return [];
  }
}
