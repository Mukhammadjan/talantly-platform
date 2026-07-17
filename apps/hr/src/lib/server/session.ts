import { cookies } from "next/headers";
import { auth } from "@talantly/shared";

// Web = httpOnly cookie sessiya (desktop uchun tabiiy). Mini App bilan
// BIR XIL JWT (WEBAPP_JWT_SECRET) — bir foydalanuvchi, ikki kirish nuqtasi.

export const SESSION_COOKIE = "talantly_hr_session";
export type Session = auth.SessionPayload;

function secret(): string {
  const s = process.env.WEBAPP_JWT_SECRET;
  if (!s) throw new Error("WEBAPP_JWT_SECRET yo'q");
  return s;
}

export async function signSession(p: Session): Promise<string> {
  return auth.signSession(p, secret());
}

/** Joriy sessiya (cookie'dan). Yo'q/yaroqsiz bo'lsa null. */
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return auth.verifySessionToken(token, secret());
}
