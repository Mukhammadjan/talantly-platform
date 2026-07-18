import { NextResponse } from "next/server";
import { cvProfilesRepo, generateCv, type Direction } from "@talantly/shared";
import { adminSession } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";
import { applyEvent, logEntityStatus } from "@/lib/server/talentFlow";

export const dynamic = "force-dynamic";

interface PaymentRow {
  id: string;
  talent_id: string | null;
  amount: number;
  screenshot_path: string | null;
  created_at: string;
}

interface UnlockRow {
  id: string;
  company_id: string | null;
  talent_id: string | null;
  kind: string;
  amount: number;
  created_at: string;
}

/** GET — kutilayotgan to'lovlar: talant CV cheklari + kompaniya unlock'lari. */
export async function GET(): Promise<NextResponse> {
  const session = await adminSession();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const db = getDb();
  const [{ data: payData }, { data: unlockData }] = await Promise.all([
    db
      .from("payments")
      .select("id, talent_id, amount, screenshot_path, created_at")
      .eq("status", "kutilmoqda")
      .order("created_at", { ascending: true }),
    db
      .from("contact_unlocks")
      .select("id, company_id, talent_id, kind, amount, created_at")
      .eq("status", "kutilmoqda")
      .order("created_at", { ascending: true }),
  ]);

  const payments = (payData ?? []) as PaymentRow[];
  const unlocks = (unlockData ?? []) as UnlockRow[];

  const cv = await Promise.all(
    payments.map(async (p) => {
      const { data: talent } = p.talent_id
        ? await db
            .from("talents")
            .select("full_name, direction")
            .eq("id", p.talent_id)
            .maybeSingle()
        : { data: null };
      let screenshotUrl: string | null = null;
      if (p.screenshot_path) {
        const { data: signed } = await db.storage
          .from("payment-screenshots")
          .createSignedUrl(p.screenshot_path, 3600);
        screenshotUrl = signed?.signedUrl ?? null;
      }
      return {
        id: p.id,
        kind: "cv" as const,
        amount: p.amount,
        createdAt: p.created_at,
        who: (talent as { full_name: string | null } | null)?.full_name ?? "?",
        detail:
          (talent as { direction: string | null } | null)?.direction ?? "",
        screenshotUrl,
      };
    }),
  );

  const unlock = await Promise.all(
    unlocks.map(async (u) => {
      const { data: company } = u.company_id
        ? await db
            .from("companies")
            .select("name")
            .eq("id", u.company_id)
            .maybeSingle()
        : { data: null };
      return {
        id: u.id,
        kind: "unlock" as const,
        amount: u.amount,
        createdAt: u.created_at,
        who: (company as { name: string | null } | null)?.name ?? "?",
        detail: u.kind,
        screenshotUrl: null,
      };
    }),
  );

  return NextResponse.json({ items: [...cv, ...unlock] });
}

/** POST { kind, id, action: "approve"|"reject" } — bot /tolovlar bilan bir mantiq. */
export async function POST(req: Request): Promise<NextResponse> {
  const session = await adminSession();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: { kind?: string; id?: string; action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const { kind, id, action } = body;
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const db = getDb();
  const changedBy = `admin-web:${session.tgId}`;

  if (kind === "cv") {
    const { data } = await db
      .from("payments")
      .select("id, talent_id, status")
      .eq("id", id)
      .maybeSingle();
    const pay = data as { id: string; talent_id: string | null; status: string } | null;
    if (!pay || pay.status !== "kutilmoqda") {
      return NextResponse.json({ error: "already_done" }, { status: 409 });
    }
    const { data: t } = pay.talent_id
      ? await db.from("talents").select("*").eq("id", pay.talent_id).maybeSingle()
      : { data: null };
    const talent = t as {
      id: string;
      status: string;
      full_name: string | null;
      birth_year: number | null;
      city: string | null;
      direction: string | null;
      free_text: string | null;
      portfolio_url: string | null;
    } | null;
    if (!talent) return NextResponse.json({ error: "talent_missing" }, { status: 404 });

    const newStatus = action === "approve" ? "tasdiqlangan" : "rad";
    await db.from("payments").update({ status: newStatus }).eq("id", id);
    await logEntityStatus({
      entity: "payments",
      entityId: id,
      oldStatus: "kutilmoqda",
      newStatus,
      changedBy,
    });
    await applyEvent(
      { id: talent.id, status: talent.status },
      action === "approve" ? "tolov_tasdiqlandi" : "tolov_rad",
      changedBy,
    );

    if (action === "approve") {
      // AI CV — pdfWorker (bot) PDF qilib yuboradi va cv_tayyor'ga o'tkazadi.
      const existing = await cvProfilesRepo.findByTalentId(db, talent.id);
      if (!existing) {
        const cv = generateCv({
          fullName: talent.full_name ?? "",
          birthYear: talent.birth_year ?? 0,
          city: talent.city ?? "",
          direction: (talent.direction ?? "boshqa") as Direction,
          education: "",
          freeText: talent.free_text ?? "",
          portfolioUrl: talent.portfolio_url,
        });
        await cvProfilesRepo.upsertByTalentId(db, {
          talent_id: talent.id,
          summary: cv.summary,
          skills: cv.skills,
          experience: cv.experience,
          ai_verdict: cv.aiVerdict,
          pdf_path: null,
          generated_at: new Date().toISOString(),
        });
      }
    }
    return NextResponse.json({ ok: true });
  }

  if (kind === "unlock") {
    const { data } = await db
      .from("contact_unlocks")
      .select("id, kind, status")
      .eq("id", id)
      .maybeSingle();
    const u = data as { id: string; kind: string; status: string } | null;
    if (!u || u.status !== "kutilmoqda") {
      return NextResponse.json({ error: "already_done" }, { status: 409 });
    }
    if (action === "approve") {
      const expires =
        u.kind === "obuna"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;
      await db
        .from("contact_unlocks")
        .update({ status: "tasdiqlangan", expires_at: expires })
        .eq("id", id);
      await logEntityStatus({
        entity: "contact_unlocks",
        entityId: id,
        oldStatus: "kutilmoqda",
        newStatus: "tasdiqlangan",
        changedBy,
      });
    } else {
      await db.from("contact_unlocks").update({ status: "rad" }).eq("id", id);
      await logEntityStatus({
        entity: "contact_unlocks",
        entityId: id,
        oldStatus: "kutilmoqda",
        newStatus: "rad",
        changedBy,
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad_kind" }, { status: 400 });
}
