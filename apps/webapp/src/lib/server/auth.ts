import { createHmac, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

// initData'ga faqat SERVER tomonda HMAC tekshiruvidan keyin ishoniladi
// (guardrail #9). initDataUnsafe hech qachon ishlatilmaydi.

const INITDATA_MAX_AGE_S = 24 * 60 * 60;
const SESSION_TTL = "7d";

export interface SessionPayload {
  userId: string;
  tgId: number;
}

export interface VerifiedInitData {
  tgId: number;
  username: string | null;
  firstName: string | null;
}

export function verifyInitData(
  initData: string,
  botToken: string,
): VerifiedInitData | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(hash, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get("auth_date") ?? 0);
  const ageS = Math.abs(Date.now() / 1000 - authDate);
  if (!authDate || ageS > INITDATA_MAX_AGE_S) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;
  try {
    const u = JSON.parse(userRaw) as {
      id?: number;
      username?: string;
      first_name?: string;
    };
    if (!u.id) return null;
    return {
      tgId: u.id,
      username: u.username ?? null,
      firstName: u.first_name ?? null,
    };
  } catch {
    return null;
  }
}

function secretKey(): Uint8Array {
  const s = process.env.WEBAPP_JWT_SECRET;
  if (!s) throw new Error("WEBAPP_JWT_SECRET yo'q");
  return new TextEncoder().encode(s);
}

export async function signSession(p: SessionPayload): Promise<string> {
  return new SignJWT({ userId: p.userId, tgId: p.tgId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

/** Authorization: Bearer <jwt> dan sessiyani o'qiydi; xato bo'lsa null. */
export async function readSession(req: Request): Promise<SessionPayload | null> {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(h.slice("Bearer ".length), secretKey());
    if (typeof payload.userId === "string" && typeof payload.tgId === "number") {
      return { userId: payload.userId, tgId: payload.tgId };
    }
    return null;
  } catch {
    return null;
  }
}
