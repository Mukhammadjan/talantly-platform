import { cvProfilesRepo, generateCv, talentsRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { serverEnv } from "@/lib/server/env";
import { buildSnapshot, loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();
    const { user, talent } = context;

    if (talent.status !== "yangi") {
      return conflict("Ro'yxatdan o'tish allaqachon yakunlangan.");
    }

    const missing =
      !talent.full_name ||
      !talent.birth_year ||
      !talent.city ||
      !talent.direction ||
      !talent.education ||
      !talent.free_text ||
      !user.phone;
    if (missing) {
      return badRequest(
        "Ba'zi ma'lumotlar to'ldirilmagan. Qadamlarni yakunlang.",
      );
    }

    // setStatus also writes the mandatory status_log row (guardrail #8).
    let updated = await talentsRepo.setStatus(
      client,
      talent,
      "malumot_toldirilgan",
      user.id,
      { bot_state: {} },
    );

    // Demo mode (PAYMENT_ENABLED=false): skip the manual payment step and
    // start CV generation immediately. The CvJson is stored here; the bot
    // process renders the PDF and advances the status to cv_tayyor.
    if (!serverEnv.paymentEnabled) {
      const cv = generateCv({
        fullName: updated.full_name ?? "",
        birthYear: updated.birth_year ?? 0,
        city: updated.city ?? "",
        direction: updated.direction ?? "boshqa",
        education: updated.education ?? "",
        freeText: updated.free_text ?? "",
        portfolioUrl: updated.portfolio_url,
      });
      await cvProfilesRepo.upsertByTalentId(client, {
        talent_id: updated.id,
        summary: cv.summary,
        skills: cv.skills,
        experience: cv.experience,
        ai_verdict: cv.aiVerdict,
        pdf_path: null,
        generated_at: new Date().toISOString(),
      });
      updated = await talentsRepo.setStatus(
        client,
        updated,
        "tolov_tasdiqlangan",
        user.id,
      );
    }

    const snapshot = await buildSnapshot(client, user, updated);
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("POST /api/register/finish failed:", err);
    return serverError();
  }
}
