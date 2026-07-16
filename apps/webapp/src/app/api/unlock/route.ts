import { NextResponse } from "next/server";
import { readSession } from "@/lib/server/auth";
import { ensureCompany } from "@/lib/server/companies";
import { getDb } from "@/lib/server/db";
import { getSettingInt } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

/** Kontakt ochish to'lovi — contact_unlocks (kutilmoqda). Narx settings'dan. */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await readSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { talentId?: unknown; kind?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof body.talentId !== "string") {
    return NextResponse.json({ error: "talentId_required" }, { status: 400 });
  }
  const kind = body.kind === "obuna" ? "obuna" : "bir_martalik";

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

  const amount =
    kind === "obuna"
      ? await getSettingInt("subscription_price", 2500000)
      : await getSettingInt("contact_unlock_price", 99000);

  const company = await ensureCompany(session);
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
  return NextResponse.json({ id: row.id, status: row.status, amount });
}
