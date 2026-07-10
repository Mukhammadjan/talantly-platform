import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "./env";

export interface SharePayload {
  companyId: string;
  talentIds: string[];
  exp: number;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(data: string): string {
  return b64url(
    createHmac("sha256", serverEnv.supabaseServiceRoleKey).update(data).digest(),
  );
}

export function createShareToken(
  companyId: string,
  talentIds: string[],
  ttlDays = 7,
): string {
  const payload: SharePayload = {
    companyId,
    talentIds,
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(body)}`;
}

export function verifyShareToken(token: string): SharePayload | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let payload: SharePayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof payload.companyId !== "string" ||
    !Array.isArray(payload.talentIds) ||
    typeof payload.exp !== "number" ||
    payload.exp < Date.now()
  ) {
    return null;
  }
  return payload;
}
