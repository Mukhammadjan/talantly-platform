import { NextResponse } from "next/server";
import { signSession, verifyInitData } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface AuthBody {
  initData?: string;
  role?: string;
}

/** initData HMAC → users upsert → JWT. */
export async function POST(req: Request): Promise<NextResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "server_config" }, { status: 500 });
  }

  let body: AuthBody;
  try {
    body = (await req.json()) as AuthBody;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (!body.initData) {
    return NextResponse.json({ error: "initData_required" }, { status: 400 });
  }

  const verified = verifyInitData(body.initData, botToken);
  if (!verified) {
    return NextResponse.json({ error: "invalid_initData" }, { status: 401 });
  }

  const mode =
    body.role === "talant" || body.role === "izlovchi" ? body.role : null;

  const db = getDb();
  const { data: existing, error: findErr } = await db
    .from("users")
    .select("*")
    .eq("tg_id", verified.tgId)
    .maybeSingle();
  if (findErr) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  let user = existing as {
    id: string;
    is_blocked: boolean;
    preferred_mode: string | null;
  } | null;

  if (user) {
    const patch: Record<string, unknown> = { username: verified.username };
    if (mode) patch.preferred_mode = mode;
    const { data, error } = await db
      .from("users")
      .update(patch)
      .eq("id", user.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    user = data as typeof user;
  } else {
    const { data, error } = await db
      .from("users")
      .insert({
        tg_id: verified.tgId,
        username: verified.username,
        preferred_mode: mode,
      })
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    user = data as typeof user;
  }

  if (!user || user.is_blocked) {
    return NextResponse.json({ error: "blocked" }, { status: 403 });
  }

  const token = await signSession({ userId: user.id, tgId: verified.tgId });
  return NextResponse.json({
    token,
    mode: user.preferred_mode,
  });
}
