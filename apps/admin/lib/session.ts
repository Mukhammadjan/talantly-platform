import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@talantly/shared";

// Admin sessiya JWT — o'zimizniki (rolni ham saqlaydi, middleware 403 uchun).
// Imzo siri webapp bilan bir xil, LEKIN rol har server-so'rovda DB'dan qayta
// tekshiriladi (muzlatish/rol o'zgarishi darhol kuchga kiradi).

export const ADMIN_COOKIE = "talantly_admin";
const TTL = "7d";
const MAX_AGE = 7 * 24 * 60 * 60;

export interface AdminToken {
  userId: string;
  role: UserRole;
}

function keyOf(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(
  payload: AdminToken,
  secret: string,
): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(TTL)
    .sign(keyOf(secret));
}

/** Edge-safe (faqat jose) — middleware ham, server ham ishlatadi. */
export async function verifyAdminToken(
  token: string,
  secret: string,
): Promise<AdminToken | null> {
  try {
    const { payload } = await jwtVerify(token, keyOf(secret));
    const role = payload.role;
    if (
      typeof payload.sub === "string" &&
      (role === "admin" || role === "moderator" || role === "talent")
    ) {
      return { userId: payload.sub, role };
    }
    return null;
  } catch {
    return null;
  }
}

export function adminCookieOptions(): {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}
