import { NextResponse } from "next/server";
import { auth } from "@talantly/shared";
import { verifyPassword } from "@talantly/shared/auth/password";
import { serverEnv } from "@/lib/env";
import { getServiceClient } from "@/lib/supabase/service";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  signAdminToken,
} from "@/lib/session";

// argon2 (native) — Node.js runtime shart.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MIN = 15;
const MAX_FAILS = 5;

/**
 * Panel kirishi: telefon + parol → argon2 verify → rol tekshiruvi → JWT cookie.
 * Faqat role admin|moderator + account_status='active' o'tadi.
 */
export async function POST(req: Request): Promise<NextResponse> {
  let body: { phone?: unknown; password?: unknown };
  try {
    body = (await req.json()) as { phone?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const phone = auth.normalizePhone(
    typeof body.phone === "string" ? body.phone : "",
  );
  const password = typeof body.password === "string" ? body.password : "";
  if (!phone || !password) {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  const db = getServiceClient();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const since = new Date(Date.now() - WINDOW_MIN * 60_000).toISOString();
  const { count } = await db
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("phone", phone)
    .eq("ok", false)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_FAILS) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const logAttempt = async (ok: boolean): Promise<void> => {
    await db.from("login_attempts").insert({ phone, ok, ip });
  };

  const { data: row } = await db
    .from("users")
    .select("id, role, is_blocked, password_hash, account_status")
    .eq("phone", phone)
    .maybeSingle();
  const user = row as
    | {
        id: string;
        role: string;
        is_blocked: boolean;
        password_hash: string | null;
        account_status: string;
      }
    | null;

  // Bir xil xabar — akkaunt bor/yo'qligi oshkor bo'lmaydi.
  const invalid = async (): Promise<NextResponse> => {
    await logAttempt(false);
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  };

  if (!user || !user.password_hash) return invalid();
  if (user.role !== "admin" && user.role !== "moderator") return invalid();
  if (user.is_blocked || user.account_status !== "active") {
    await logAttempt(false);
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const ok = await verifyPassword(user.password_hash, password);
  await logAttempt(ok);
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 401 });

  const token = await signAdminToken(
    { userId: user.id, role: user.role },
    serverEnv.jwtSecret,
  );
  const landing = user.role === "admin" ? "/dashboard" : "/talantlar";
  const res = NextResponse.json({ ok: true, redirect: landing });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
