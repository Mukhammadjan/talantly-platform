import { interviewSlotsRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import type { SlotPublic } from "@/lib/apiTypes";
import {
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();

    if (context.talent.status !== "test_otgan") {
      return conflict("Suhbat bron qilish faqat testdan so'ng ochiladi.");
    }

    const slots = await interviewSlotsRepo.openFuture(client);
    const payload: SlotPublic[] = slots.map((slot) => ({
      id: slot.id,
      startsAt: slot.starts_at,
    }));
    return NextResponse.json({ slots: payload });
  } catch (err) {
    console.error("GET /api/slots failed:", err);
    return serverError();
  }
}
