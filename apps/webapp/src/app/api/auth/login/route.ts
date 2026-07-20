import { NextResponse } from "next/server";
import { auth } from "@talantly/shared";
import { getDb } from "@/lib/server/db";

// argon2 (native) — Node.js runtime shart (edge emas).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MIN = 15;
const MAX_FAILS = 5;

interface UserRow {
  id: string;
  tg_id: number | null;
  is_blocked: boolean;
  preferred_mode: string | null;
  password_hash: string | null;
}

/**
 * Web (brauzer) kirish: telefon + parol → argon2 verify → JWT.
 * Mini App bilan BIR XIL JWT/tizim (bitta tg_id, bitta akkaunt).
 * Rate-limit 5 muvaffaqiyatsiz urinish / 15 daqiqa / telefon.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const secret = process.env.WEBAPP_JWT_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "server_config" }, { status: 500 });
  }

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

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const db = getDb();

  // Rate-limit: oxirgi 15 daqiqada MAX_FAILS muvaffaqiyatsiz urinish → 429.
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
    // Faqat telefon/natija/IP — ochiq parol HECH QACHON yozilmaydi.
    await db.from("login_attempts").insert({ phone, ok, ip });
  };

  const { data: row } = await db
    .from("users")
    .select("id, tg_id, is_blocked, preferred_mode, password_hash")
    .eq("phone", phone)
    .maybeSingle();
  const user = row as UserRow | null;

  if (!user || !user.password_hash || user.tg_id == null) {
    await logAttempt(false);
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }
  if (user.is_blocked) {
    await logAttempt(false);
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  const ok = await auth.verifyPassword(user.password_hash, password);
  await logAttempt(ok);
  if (!ok) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const token = await auth.signSession(
    { userId: user.id, tgId: user.tg_id },
    secret,
  );
  return NextResponse.json({
    token,
    preferredMode: user.preferred_mode ?? null,
  });
}
