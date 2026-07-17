import { NextResponse } from "next/server";
import { auth } from "@talantly/shared";
import { getDb } from "@/lib/server/db";
import { SESSION_COOKIE, signSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/**
 * Telegram Login Widget → server hash tekshiruvi → bir xil JWT (cookie).
 * Web va Mini App bir xil users.tg_id — bitta kompaniya profili.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "server_config" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // Login Widget maydonlarini string xaritaga aylantiramiz.
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (v !== null && v !== undefined) data[k] = String(v);
  }

  const verified = auth.verifyLoginWidget(data, botToken);
  if (!verified) {
    return NextResponse.json({ error: "invalid_login" }, { status: 401 });
  }

  const db = getDb();
  const { data: existing, error: findErr } = await db
    .from("users")
    .select("id, is_blocked, preferred_mode")
    .eq("tg_id", verified.tgId)
    .maybeSingle();
  if (findErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  type UserRow = {
    id: string;
    is_blocked: boolean;
    preferred_mode: string | null;
  };
  let user = existing as UserRow | null;

  if (user) {
    const { data, error } = await db
      .from("users")
      .update({ username: verified.username, preferred_mode: "izlovchi" })
      .eq("id", user.id)
      .select("id, is_blocked, preferred_mode")
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    user = data as UserRow;
  } else {
    const { data, error } = await db
      .from("users")
      .insert({
        tg_id: verified.tgId,
        username: verified.username,
        preferred_mode: "izlovchi",
      })
      .select("id, is_blocked, preferred_mode")
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    user = data as UserRow;
  }

  if (!user || user.is_blocked) {
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  const token = await signSession({ userId: user.id, tgId: verified.tgId });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
