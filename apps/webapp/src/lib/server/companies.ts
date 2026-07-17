import type { SessionPayload } from "./auth";
import { getDb } from "./db";

export interface CompanyRowV2 {
  id: string;
  user_id: string;
  name: string;
  is_demo: boolean;
  is_verified?: boolean;
}

/** Faol obuna bormi — contact_unlocks kind='obuna' tasdiqlangan, muddati o'tmagan. */
export async function hasActiveSubscription(companyId: string): Promise<boolean> {
  const { data } = await getDb()
    .from("contact_unlocks")
    .select("id")
    .eq("company_id", companyId)
    .eq("kind", "obuna")
    .eq("status", "tasdiqlangan")
    .gt("expires_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

/** Sessiya egasining companies qatori — bo'lmasa yaratiladi. */
export async function ensureCompany(
  session: SessionPayload,
): Promise<CompanyRowV2> {
  const db = getDb();
  const { error: upErr } = await db.from("companies").upsert(
    { user_id: session.userId, name: "Kompaniya", is_demo: false },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (upErr) throw new Error(`companies upsert failed: ${upErr.message}`);

  const { data, error } = await db
    .from("companies")
    .select("id, user_id, name, is_demo, is_verified")
    .eq("user_id", session.userId)
    .single();
  if (error) throw new Error(`companies read failed: ${error.message}`);
  return data as CompanyRowV2;
}
