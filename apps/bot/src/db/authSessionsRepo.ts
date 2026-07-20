import { getSupabase } from "./client.js";

/** Bot parol-o'rnatish oqimi holati (DB'da — restart'da yo'qolmaydi). */
export interface AuthFlowSession {
  step: string;
  data: Record<string, unknown>;
}

const TTL_MINUTES = 10;

/** Faol sessiya (muddati o'tgan bo'lsa tozalab null qaytaradi). */
export async function getSession(tgId: number): Promise<AuthFlowSession | null> {
  const { data, error } = await getSupabase()
    .from("bot_auth_sessions")
    .select("step, data, expires_at")
    .eq("tg_id", tgId)
    .maybeSingle();
  if (error) throw new Error(`authSessions.get failed: ${error.message}`);
  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await clearSession(tgId);
    return null;
  }
  return {
    step: data.step,
    data: (data.data as Record<string, unknown>) ?? {},
  };
}

/** Sessiyani o'rnatadi/yangilaydi (muddati now + 10 daqiqa). */
export async function setSession(
  tgId: number,
  step: string,
  data: Record<string, unknown>,
): Promise<void> {
  const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();
  const { error } = await getSupabase()
    .from("bot_auth_sessions")
    .upsert(
      { tg_id: tgId, step, data, expires_at: expiresAt },
      { onConflict: "tg_id" },
    );
  if (error) throw new Error(`authSessions.set failed: ${error.message}`);
}

export async function clearSession(tgId: number): Promise<void> {
  const { error } = await getSupabase()
    .from("bot_auth_sessions")
    .delete()
    .eq("tg_id", tgId);
  if (error) throw new Error(`authSessions.clear failed: ${error.message}`);
}
