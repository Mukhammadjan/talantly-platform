import { NextResponse } from "next/server";
import { auth } from "@talantly/shared";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

/**
 * Web (brauzer) kirish: Telegram Login Widget → hash tekshiruvi → JWT (json).
 * Mini App bilan BIR XIL users qatori — bitta akkaunt, ikki kirish nuqtasi.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.WEBAPP_JWT_SECRET;
  if (!botToken || !secret) {
    return NextResponse.json({ error: "server_config" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const role =
    body.role === "talant" || body.role === "izlovchi"
      ? (body.role as string)
      : null;
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k !== "role" && v !== null && v !== undefined) data[k] = String(v);
  }

  const verified = auth.verifyLoginWidget(data, botToken);
  if (!verified) {
    return NextResponse.json({ error: "invalid_login" }, { status: 401 });
  }

  const db = getDb();
  const { data: existing } = await db
    .from("users")
    .select("id, is_blocked, preferred_mode")
    .eq("tg_id", verified.tgId)
    .maybeSingle();

  interface UserRow {
    id: string;
    is_blocked: boolean;
    preferred_mode: string | null;
  }
  let user = existing as UserRow | null;

  if (!user) {
    const { data: created, error } = await db
      .from("users")
      .insert({
        tg_id: verified.tgId,
        ...(role ? { preferred_mode: role } : {}),
      })
      .select("id, is_blocked, preferred_mode")
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    user = created as UserRow;
  } else if (role && user.preferred_mode !== role) {
    await db.from("users").update({ preferred_mode: role }).eq("id", user.id);
  }

  if (!user || user.is_blocked) {
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  const token = await auth.signSession(
    { userId: user.id, tgId: verified.tgId },
    secret,
  );
  return NextResponse.json({
    token,
    preferredMode: user.preferred_mode ?? role,
  });
}
