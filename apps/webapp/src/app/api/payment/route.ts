import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { getDb } from "@/lib/server/db";
import { getSetting, getSettingInt } from "@/lib/server/settings";
import { applyEvent, ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

const BUCKET = "payment-screenshots";
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

interface PaymentRow {
  id: string;
  status: string;
  created_at: string;
}

async function latestPayment(talentId: string): Promise<PaymentRow | null> {
  const { data } = await getDb()
    .from("payments")
    .select("id, status, created_at")
    .eq("talent_id", talentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as PaymentRow | null;
}

/** GET — to'lov sahifasi ma'lumoti: karta, narx, joriy holat. */
export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const talent = await ensureTalent(g.session);
  const [card, owner, price, payment] = await Promise.all([
    getSetting("payment_card_number"),
    getSetting("payment_card_owner"),
    getSettingInt("cv_price", 35000),
    latestPayment(talent.id),
  ]);

  return NextResponse.json({
    card: card ?? "",
    owner: owner ?? "",
    price,
    status: talent.status,
    payment: payment
      ? { status: payment.status, createdAt: payment.created_at }
      : null,
  });
}

/** POST { image: dataUrl } — chek screenshot: storage + payments + chek_yuborildi. */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  let body: { image?: unknown };
  try {
    body = (await req.json()) as { image?: unknown };
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const dataUrl = typeof body.image === "string" ? body.image : "";
  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!m || !m[1] || !m[2]) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }
  const ext = m[1] === "jpeg" ? "jpg" : m[1];
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image_too_large" }, { status: 413 });
  }

  const talent = await ensureTalent(g.session);
  // Chek faqat to'lov bosqichida qabul qilinadi (rad bo'lsa qayta yuborish mumkin).
  if (
    talent.status !== "malumot_toldirilgan" &&
    talent.status !== "tolov_kutilmoqda"
  ) {
    return NextResponse.json(
      { error: "invalid_status", status: talent.status },
      { status: 409 },
    );
  }
  const pending = await latestPayment(talent.id);
  if (pending?.status === "kutilmoqda") {
    return NextResponse.json({ error: "already_pending" }, { status: 409 });
  }

  const db = getDb();
  const path = `${talent.id}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await db.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: `image/${m[1]}` });
  if (upErr) {
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const price = await getSettingInt("cv_price", 35000);
  const { error: insErr } = await db.from("payments").insert({
    talent_id: talent.id,
    amount: price,
    screenshot_path: path,
    status: "kutilmoqda",
  });
  if (insErr) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const next = await applyEvent(
    talent,
    "chek_yuborildi",
    `talant:${g.session.tgId}`,
  );
  return NextResponse.json({ ok: true, status: next ?? talent.status });
}
