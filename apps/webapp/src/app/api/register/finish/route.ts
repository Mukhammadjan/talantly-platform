import { talentsRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
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
      !talent.level ||
      !talent.headline ||
      (talent.skill_tags ?? []).length === 0 ||
      (talent.work_formats ?? []).length === 0 ||
      !user.phone;
    if (missing) {
      return badRequest(
        "Ba'zi ma'lumotlar to'ldirilmagan. Qadamlarni yakunlang.",
      );
    }

    // Verification-first flow: the CV is generated ONLY after the moderator
    // marks the talent 'tekshirilgan' (see the bot's approval handler). No CV
    // may exist before verification.
    const updated = await talentsRepo.setStatus(
      client,
      talent,
      "malumot_toldirilgan",
      user.id,
      { bot_state: {} },
    );

    const snapshot = await buildSnapshot(client, user, updated);
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("POST /api/register/finish failed:", err);
    return serverError();
  }
}
