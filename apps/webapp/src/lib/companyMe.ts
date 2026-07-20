import { authedFetch } from "./auth";

export interface MyCompany {
  id: string;
  name: string;
  activityType: string;
  city: string;
  district: string;
  about: string;
  logoUrl: string | null;
  directions: string[];
  neededLevel: string;
  verified: boolean;
}

export interface CompanyUpdate {
  name?: string;
  activityType?: string;
  city?: string;
  district?: string;
  about?: string;
  directions?: string[];
  neededLevel?: string;
}

export async function fetchMyCompany(): Promise<{
  company: MyCompany;
  subscriptionActive: boolean;
} | null> {
  try {
    const res = await authedFetch("/api/company");
    if (!res.ok) return null;
    return (await res.json()) as { company: MyCompany; subscriptionActive: boolean };
  } catch {
    return null;
  }
}

export async function updateMyCompany(
  patch: CompanyUpdate,
): Promise<MyCompany | null> {
  try {
    const res = await authedFetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { company: MyCompany };
    return d.company ?? null;
  } catch {
    return null;
  }
}
