import { NextResponse } from "next/server";
import { serverEnv } from "./env";
import { verifySession, type SessionPayload } from "./jwt";

export async function requireSession(
  request: Request,
): Promise<SessionPayload | null> {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  return verifySession(token, serverEnv.jwtSecret);
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "Avtorizatsiya talab qilinadi." },
    { status: 401 },
  );
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function conflict(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function serverError(): NextResponse {
  return NextResponse.json(
    { error: "Texnik xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring." },
    { status: 500 },
  );
}
