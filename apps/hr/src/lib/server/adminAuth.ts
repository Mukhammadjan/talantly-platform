import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Admin kirish: login + parol (env'da) → alohida httpOnly cookie (JWT).
// HR (kompaniya) Telegram-login oqimiga tegilmaydi.

export const ADMIN_COOKIE = "talantly_admin_session";
const SESSION_DAYS = 7;

function secretKey(): Uint8Array {
  const s = process.env.WEBAPP_JWT_SECRET;
  if (!s) throw new Error("WEBAPP_JWT_SECRET yo'q");
  return new TextEncoder().encode(s);
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Uzunlik farqida ham vaqt-sobit taqqoslash uchun o'zi bilan solishtiramiz.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** Login+parol env'dagi qiymatlar bilan vaqt-sobit taqqoslanadi. */
export function checkCredentials(login: string, password: string): boolean {
  const envLogin = process.env.ADMIN_LOGIN;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (!envLogin || !envPassword) return false;
  const loginOk = safeEqual(login, envLogin);
  const passOk = safeEqual(password, envPassword);
  return loginOk && passOk;
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

/** Cookie'dagi admin JWT haqiqiymi. */
export async function isAdminAuthed(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
