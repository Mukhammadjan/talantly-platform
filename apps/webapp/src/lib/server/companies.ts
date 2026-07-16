import type { SessionPayload } from "./auth";
import { getDb } from "./db";

export interface CompanyRowV2 {
  id: string;
  user_id: string;
  name: string;
  is_demo: boolean;
}

/** Sessiya egasining companies qatori — bo'lmasa yaratiladi. */
export async function ensureCompany(
  session: SessionPayload,
): Promise<CompanyRowV2> {
  const db = getDb();
  const { data: found, error: findErr } = await db
    .from("companies")
    .select("id, user_id, name, is_demo")
    .eq("user_id", session.userId)
    .maybeSingle();
  if (findErr) throw new Error(`companies find failed: ${findErr.message}`);
  if (found) return found as CompanyRowV2;

  const { data: created, error: insErr } = await db
    .from("companies")
    .insert({ user_id: session.userId, name: "Kompaniya", is_demo: false })
    .select("id, user_id, name, is_demo")
    .single();
  if (insErr) throw new Error(`companies insert failed: ${insErr.message}`);
  return created as CompanyRowV2;
}
