import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkCredentials,
  signAdminToken,
} from "@/lib/server/adminAuth";

export const dynamic = "force-dynamic";

/** POST { login, password } → admin cookie (7 kun). */
export async function POST(req: Request): Promise<NextResponse> {
  let body: { login?: unknown; password?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const login = typeof body.login === "string" ? body.login.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!login || !password) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  if (!checkCredentials(login, password)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const token = await signAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
