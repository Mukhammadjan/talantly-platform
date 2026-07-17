import type { Session } from "./session";
import { getDb } from "./db";

export interface CompanyRow {
  id: string;
  user_id: string;
  name: string;
  kind: string | null;
  activity_type: string | null;
  city: string | null;
  district: string | null;
  description: string | null;
  directions_needed: string[] | null;
  is_verified: boolean;
  is_demo: boolean;
}

/** Sessiya egasining kompaniyasi — bo'lmasa yaratiladi (poyga-xavfsiz).
 *  Mini App'dagi ensureCompany bilan bir xil mantiq (bitta tg_id → bitta kompaniya). */
export async function ensureCompany(session: Session): Promise<CompanyRow> {
  const db = getDb();
  // ON CONFLICT DO NOTHING — layout+page parallel chaqirsa ham bitta qator.
  const { error: upErr } = await db.from("companies").upsert(
    { user_id: session.userId, name: "Kompaniya", is_demo: false },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (upErr) throw new Error(`companies upsert failed: ${upErr.message}`);

  const { data, error } = await db
    .from("companies")
    .select("*")
    .eq("user_id", session.userId)
    .single();
  if (error) throw new Error(`companies read failed: ${error.message}`);
  return data as CompanyRow;
}
