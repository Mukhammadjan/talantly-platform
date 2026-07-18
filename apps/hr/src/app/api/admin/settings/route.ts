import { NextResponse } from "next/server";
import { adminAuthed } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

// Faqat shu kalitlar tahrirlanadi — boshqasiga teginish yo'q.
const EDITABLE: Record<string, "int" | "bool" | "text"> = {
  cv_price: "int",
  contact_unlock_price: "int",
  subscription_price: "int",
  success_fee_intern: "int",
  success_fee_mutaxassis: "int",
  success_fee_tech: "int",
  cv_payment_required: "bool",
  show_demo_data: "bool",
  payment_card_number: "text",
  payment_card_owner: "text",
};

export async function GET(): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { data } = await getDb()
    .from("settings")
    .select("key, value")
    .in("key", Object.keys(EDITABLE));
  return NextResponse.json({ items: data ?? [] });
}

/** POST { key, value } — whitelist + tur tekshiruvi + status_log. */
export async function POST(req: Request): Promise<NextResponse> {
  if (!(await adminAuthed())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  let body: { key?: string; value?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const key = body.key ?? "";
  const kind = EDITABLE[key];
  if (!kind) return NextResponse.json({ error: "bad_key" }, { status: 400 });

  let value = (body.value ?? "").trim();
  if (kind === "int") {
    const n = Number(value.replace(/\s+/g, ""));
    if (!Number.isFinite(n) || n < 0 || n > 100_000_000) {
      return NextResponse.json({ error: "bad_value" }, { status: 400 });
    }
    value = String(Math.round(n));
  } else if (kind === "bool") {
    if (!["true", "false"].includes(value)) {
      return NextResponse.json({ error: "bad_value" }, { status: 400 });
    }
  } else if (value.length === 0 || value.length > 120) {
    return NextResponse.json({ error: "bad_value" }, { status: 400 });
  }

  // status_log.entity_id uuid — settings kaliti matn, shu sabab loglanmaydi.
  const { error } = await getDb()
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
