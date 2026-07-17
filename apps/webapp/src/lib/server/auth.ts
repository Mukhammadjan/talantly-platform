import { auth } from "@talantly/shared";

// Yagona auth mantiqi @talantly/shared'da (Mini App + Web bir xil).
// Bu yerda faqat webapp uchun sozlamalar (secret + Bearer o'qish).

export type SessionPayload = auth.SessionPayload;
export type VerifiedInitData = auth.VerifiedTgUser;

function secret(): string {
  const s = process.env.WEBAPP_JWT_SECRET;
  if (!s) throw new Error("WEBAPP_JWT_SECRET yo'q");
  return s;
}

export function verifyInitData(
  initData: string,
  botToken: string,
): VerifiedInitData | null {
  return auth.verifyInitData(initData, botToken);
}

export async function signSession(p: SessionPayload): Promise<string> {
  return auth.signSession(p, secret());
}

/** Authorization: Bearer <jwt> dan sessiyani o'qiydi. */
export async function readSession(req: Request): Promise<SessionPayload | null> {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return auth.verifySessionToken(h.slice("Bearer ".length), secret());
}
