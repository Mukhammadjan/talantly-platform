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
  const { error: upErr } = await db.from("companies").upsert(
    { user_id: session.userId, name: "Kompaniya", is_demo: false },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (upErr) throw new Error(`companies upsert failed: ${upErr.message}`);

  const { data, error } = await db
    .from("companies")
    .select("id, user_id, name, is_demo")
    .eq("user_id", session.userId)
    .single();
  if (error) throw new Error(`companies read failed: ${error.message}`);
  return data as CompanyRowV2;
}
