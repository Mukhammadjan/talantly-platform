/**
 * AUTH v3 — web login E2E (dev server 3001'ga real HTTP).
 * Isbotlaydi: to'g'ri→200+token · xato→401 · rate-limit 5/15daq→429 ·
 * token /api/me'da qabul qilinadi · web login + Mini App BITTA users qatori (SQL).
 *
 * Shart: `npm run dev:webapp` (yoki preview) 3001'da ishlab tursin.
 * Ishga tushirish: tsx apps/bot/src/scripts/testWebLogin.ts
 */
import { auth, createServiceClient } from "@talantly/shared";
import { config } from "../config.js"; // .env yuklaydi (side-effect)

const BASE = process.env.WEB_BASE ?? "http://localhost:3001";
const TG_ID = 999500222;
const PHONE = "+998905550222";
const PW = "WebPass12345";

const db = createServiceClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
);
const SECRET = process.env.WEBAPP_JWT_SECRET ?? "";

let failures = 0;
function check(name: string, cond: boolean, extra = ""): void {
  console.log(`${cond ? "✅" : "❌"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!cond) failures++;
}

async function login(
  phone: string,
  password: string,
): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });
  let body: Record<string, unknown> | null = null;
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    /* empty */
  }
  return { status: res.status, body };
}

async function cleanupAttempts(): Promise<void> {
  await db.from("login_attempts").delete().eq("phone", PHONE);
}

async function cleanupAll(): Promise<void> {
  await db.from("users").delete().eq("tg_id", TG_ID);
  await db.from("users").delete().eq("phone", PHONE);
  await cleanupAttempts();
}

async function main(): Promise<void> {
  await cleanupAll();

  // Seed: bot o'rnatgandek — telefon + argon2 hash.
  const hash = await auth.hashPassword(PW);
  const { data: seeded, error } = await db
    .from("users")
    .insert({
      tg_id: TG_ID,
      phone: PHONE,
      password_hash: hash,
      password_set_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !seeded) {
    console.error("Seed xato:", error?.message);
    process.exit(1);
  }
  const seededId = (seeded as { id: string }).id;

  // 1) To'g'ri parol → 200 + token.
  const ok = await login(PHONE, PW);
  check("to'g'ri kirish → 200", ok.status === 200);
  const token = typeof ok.body?.token === "string" ? ok.body.token : "";
  check("token qaytdi", token.length > 20);

  // 2) Token bir xil tizim: tgId + userId to'g'ri.
  const payload = token ? await auth.verifySessionToken(token, SECRET) : null;
  check("token'da tgId to'g'ri", payload?.tgId === TG_ID);
  check(
    "token'dagi userId = users qatori (web=MiniApp bitta profil)",
    payload?.userId === seededId,
  );

  // 3) Xato parol → 401.
  await cleanupAttempts();
  const bad = await login(PHONE, "wrong-password");
  check("xato parol → 401", bad.status === 401);

  // 4) Normalizatsiya: raqamsiz format ham ishlaydi.
  await cleanupAttempts();
  const norm = await login("905550222", PW);
  check("normalizatsiya (905550222) → 200", norm.status === 200);

  // 5) Rate-limit: 5 muvaffaqiyatsiz → 6-si (to'g'ri bo'lsa ham) 429.
  await cleanupAttempts();
  const codes: number[] = [];
  for (let i = 0; i < 5; i++) {
    codes.push((await login(PHONE, "nope-nope")).status);
  }
  const sixth = await login(PHONE, PW); // to'g'ri parol, lekin bloklangan
  check("5 urinish 401 berdi", codes.every((c) => c === 401), codes.join(","));
  check("6-urinish → 429 (rate-limit)", sixth.status === 429);

  // 6) /api/me token'ni qabul qiladi (sessiya haqiqiy).
  const me = await fetch(`${BASE}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  check("/api/me token'ni qabul qildi (401 emas)", me.status !== 401, `status ${me.status}`);

  // 7) SQL: bitta qator — telefon + hash (Mini App tg_id shu qatorga upsert qiladi).
  const { data: rows } = await db
    .from("users")
    .select("id, tg_id, phone, password_hash")
    .eq("tg_id", TG_ID);
  const one = rows?.length === 1 ? (rows[0] as Record<string, unknown>) : null;
  check("users: aynan 1 qator", rows?.length === 1);
  check("qatorда telefon + argon2 hash", !!one && one.phone === PHONE && String(one.password_hash).startsWith("$argon2"));

  await cleanupAll();
  console.log(
    failures === 0
      ? "\n🎉 WEB LOGIN — BARCHA TEKSHIRUVLAR O'TDI"
      : `\n❌ ${failures} ta tekshiruv YIQILDI`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err: unknown) => {
  console.error("FATAL", err);
  process.exit(1);
});
