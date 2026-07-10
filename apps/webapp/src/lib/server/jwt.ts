import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  talentId: string;
  tgId: number;
}

const ALG = "HS256";
const SESSION_TTL = "12h";

export async function signSession(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(new TextEncoder().encode(secret));
}

export async function verifySession(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: [ALG],
    });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.talentId !== "string" ||
      typeof payload.tgId !== "number"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      talentId: payload.talentId,
      tgId: payload.tgId,
    };
  } catch {
    return null;
  }
}
