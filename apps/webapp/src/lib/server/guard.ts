import { NextResponse } from "next/server";
import { readSession, type SessionPayload } from "./auth";
import { getDb } from "./db";

// Har API so'rovda sessiya + is_blocked tekshiruvi (F21).
// Bloklangan user JWT muddati tugashini kutmasdan darhol 403 oladi.

export type GuardResult =
  | { ok: true; session: SessionPayload }
  | { ok: false; res: NextResponse };

export async function requireUser(req: Request): Promise<GuardResult> {
  const session = await readSession(req);
  if (!session) {
    return {
      ok: false,
      res: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  const { data } = await getDb()
    .from("users")
    .select("is_blocked")
    .eq("id", session.userId)
    .maybeSingle();
  if ((data as { is_blocked: boolean } | null)?.is_blocked) {
    return {
      ok: false,
      res: NextResponse.json({ error: "blocked" }, { status: 403 }),
    };
  }
  return { ok: true, session };
}
