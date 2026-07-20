import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { SignJWT, jwtVerify } from "jose";

// Yagona auth: Mini App (initData) VA Web (Login Widget) bir xil JWT chiqaradi.
// Server tomonda hash bot token bilan tekshiriladi — clientga ishonilmaydi.

const MAX_AGE_S = 24 * 60 * 60;
const SESSION_TTL = "7d";

export interface SessionPayload {
  userId: string;
  tgId: number;
}

export interface VerifiedTgUser {
  tgId: number;
  username: string | null;
  firstName: string | null;
  photoUrl: string | null;
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Mini App initData (query-string) — HMAC secret = HMAC("WebAppData", token). */
export function verifyInitData(
  initData: string,
  botToken: string,
): VerifiedTgUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dcs = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(dcs).digest("hex");
  if (!safeEqualHex(expected, hash)) return null;

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Math.abs(Date.now() / 1000 - authDate) > MAX_AGE_S) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;
  try {
    const u = JSON.parse(userRaw) as {
      id?: number;
      username?: string;
      first_name?: string;
      photo_url?: string;
    };
    if (!u.id) return null;
    return {
      tgId: u.id,
      username: u.username ?? null,
      firstName: u.first_name ?? null,
      photoUrl: u.photo_url ?? null,
    };
  } catch {
    return null;
  }
}

/** Telegram Login Widget — HMAC secret = SHA256(botToken) (initData'dan boshqacha). */
export function verifyLoginWidget(
  data: Record<string, string>,
  botToken: string,
): VerifiedTgUser | null {
  const { hash, ...rest } = data;
  if (!hash) return null;

  const dcs = Object.keys(rest)
    .filter((k) => rest[k] !== undefined && rest[k] !== "")
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  // Login Widget: secret_key = SHA256(botToken), keyin HMAC-SHA256(dcs, secret_key).
  const secretKey = createHash("sha256").update(botToken).digest();
  const expected = createHmac("sha256", secretKey).update(dcs).digest("hex");
  if (!safeEqualHex(expected, hash)) return null;

  const authDate = Number(rest.auth_date ?? 0);
  if (!authDate || Math.abs(Date.now() / 1000 - authDate) > MAX_AGE_S) return null;
  if (!rest.id) return null;

  return {
    tgId: Number(rest.id),
    username: rest.username ?? null,
    firstName: rest.first_name ?? null,
    photoUrl: rest.photo_url ?? null,
  };
}

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signSession(
  p: SessionPayload,
  secret: string,
): Promise<string> {
  return new SignJWT({ userId: p.userId, tgId: p.tgId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(key(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key(secret));
    if (typeof payload.userId === "string" && typeof payload.tgId === "number") {
      return { userId: payload.userId, tgId: payload.tgId };
    }
    return null;
  } catch {
    return null;
  }
}

// ---- Telefon + parol (AUTH v3) ----
// Yagona tizim: bot parol o'rnatadi, web login shu hash'ni tekshiradi, JWT bir xil.

/**
 * O'zbek raqamini E.164 (+998XXXXXXXXX) ga keltiradi.
 * Qabul qiladi: "+998901234567", "998901234567", "901234567",
 * probellar/tirelar bilan. Noto'g'ri bo'lsa null.
 */
export function normalizePhone(raw: string): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  let d = digits;
  if (d.length === 9) d = `998${d}`;
  if (d.length !== 12 || !d.startsWith("998")) return null;
  return `+${d}`;
}

export interface PasswordCheck {
  ok: boolean;
  reason?: "empty" | "short";
}

/** Parol siyosati: bo'sh/faqat probel rad, kamida 8 belgi. */
export function validatePasswordStrength(pw: string): PasswordCheck {
  if (!pw || pw.trim().length === 0) return { ok: false, reason: "empty" };
  if (pw.length < 8) return { ok: false, reason: "short" };
  return { ok: true };
}

/** argon2id hash. Ochiq parol hech qayerda saqlanmaydi — faqat hash. */
export function hashPassword(password: string): Promise<string> {
  return argonHash(password);
}

/** Saqlangan hash'ga parolni solishtiradi. Xato bo'lsa false. */
export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argonVerify(hash, password);
  } catch {
    return false;
  }
}
