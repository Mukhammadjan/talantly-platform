import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import {
  ensureCompany,
  hasActiveSubscription,
} from "@/lib/server/companies";
import { getDb, logStatus } from "@/lib/server/db";
import { getSettingInt } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

const UNVERIFIED_LIMIT = 3;

/**
 * Kontakt ochish (D13/D14/F22):
 * - dublikat bir_martalik → 409 (partial UNIQUE + oldindan tekshiruv)
 * - tekshirilmagan kompaniya: maks 3 unlock
 * - faol obuna: kontakt bepul ochiladi (amount 0, avto-tasdiq, yozuv qoladi)
 */
export async function POST(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  let body: { talentId?: unknown; kind?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.talentId !== "string") {
    return NextResponse.json({ error: "talentId_required" }, { status: 400 });
  }

  const db = getDb();
  const { data: talent } = await db
    .from("talents")
    .select("id, is_demo")
    .eq("id", body.talentId)
    .maybeSingle();
  if (!talent) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if ((talent as { is_demo: boolean }).is_demo) {
    return NextResponse.json({ error: "demo_profile" }, { status: 403 });
  }

  const company = await ensureCompany(g.session);

  // Dublikat: shu talantga kutilmoqda/tasdiqlangan yozuv bormi (D13).
  const { data: existing } = await db
    .from("contact_unlocks")
    .select("id, status")
    .eq("company_id", company.id)
    .eq("talent_id", body.talentId)
    .in("status", ["kutilmoqda", "tasdiqlangan"])
    .limit(1)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { error: "already_unlocked", status: (existing as { status: string }).status },
      { status: 409 },
    );
  }

  // Tekshirilmagan kompaniya limiti (F22).
  if (!company.is_verified) {
    const { count } = await db
      .from("contact_unlocks")
      .select("id", { count: "exact", head: true })
      .eq("company_id", company.id)
      .in("status", ["kutilmoqda", "tasdiqlangan"]);
    if ((count ?? 0) >= UNVERIFIED_LIMIT) {
      return NextResponse.json({ error: "unverified_limit" }, { status: 403 });
    }
  }

  // Faol obuna — kontakt bepul, yozuv doimiy qoladi (D15).
  const subscribed = await hasActiveSubscription(company.id);
  if (subscribed) {
    const { data: created, error } = await db
      .from("contact_unlocks")
      .insert({
        company_id: company.id,
        talent_id: body.talentId,
        kind: "obuna",
        amount: 0,
        status: "tasdiqlangan",
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
    return NextResponse.json({
      id: (created as { id: string }).id,
      status: "tasdiqlangan",
      amount: 0,
      viaSubscription: true,
    });
  }

  const kind = body.kind === "obuna" ? "obuna" : "bir_martalik";
  const amount =
    kind === "obuna"
      ? await getSettingInt("subscription_price", 2500000)
      : await getSettingInt("contact_unlock_price", 99000);

  const { data: created, error } = await db
    .from("contact_unlocks")
    .insert({
      company_id: company.id,
      talent_id: body.talentId,
      kind,
      amount,
    })
    .select("id, status")
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const row = created as { id: string; status: string };
  await logStatus({
    entity: "contact_unlocks",
    entityId: row.id,
    oldStatus: null,
    newStatus: row.status,
    changedBy: `tg:${g.session.tgId}`,
  });
  return NextResponse.json({ id: row.id, status: row.status, amount });
}
