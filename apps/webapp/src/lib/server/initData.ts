import { createHmac, timingSafeEqual } from "node:crypto";

export interface InitDataUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface ValidInitData {
  user: InitDataUser;
  authDate: number;
}

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24;

/**
 * Telegram Mini App initData check: data_check_string is all key=value pairs
 * except `hash`, sorted, joined with \n; secret = HMAC_SHA256("WebAppData",
 * bot_token); valid when HMAC_SHA256(secret, data_check_string) equals hash.
 */
export function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS,
): ValidInitData | null {
  if (!initData) return null;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(initData);
  } catch {
    return null;
  }

  const hash = params.get("hash");
  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const expected = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(hash, "hex");
  if (
    expectedBuf.length !== actualBuf.length ||
    !timingSafeEqual(expectedBuf, actualBuf)
  ) {
    return null;
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isInteger(authDate) || authDate <= 0) return null;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds - authDate > maxAgeSeconds) return null;

  const userJson = params.get("user");
  if (!userJson) return null;
  let user: unknown;
  try {
    user = JSON.parse(userJson);
  } catch {
    return null;
  }
  if (
    typeof user !== "object" ||
    user === null ||
    typeof (user as { id?: unknown }).id !== "number" ||
    typeof (user as { first_name?: unknown }).first_name !== "string"
  ) {
    return null;
  }

  return { user: user as InitDataUser, authDate };
}
