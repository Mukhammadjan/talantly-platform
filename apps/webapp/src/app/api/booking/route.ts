import { interviewSlotsRepo, interviewsRepo, talentsRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { serverEnv } from "@/lib/server/env";
import { loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

function formatDateTimeUz(iso: string): string {
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentyabr",
    "oktyabr",
    "noyabr",
    "dekabr",
  ];
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  const monthIdx = Number(get("month")) - 1;
  return `${get("day")}-${months[monthIdx] ?? ""}, soat ${get("hour")}:${get("minute")}`;
}

async function sendBookingConfirmation(
  tgId: number,
  scheduledAt: string,
): Promise<void> {
  const text =
    "📅 Suhbat vaqti tasdiqlandi!\n\n" +
    `Vaqt: ${formatDateTimeUz(scheduledAt)}\n\n` +
    "Suhbat onlayn o'tadi — moderator siz bilan shu yerda bog'lanadi. " +
    "Boshlanishidan 1 soat oldin eslatma yuboramiz. Omad! 🍀";
  const res = await fetch(
    `https://api.telegram.org/bot${serverEnv.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: tgId, text }),
    },
  );
  if (!res.ok) {
    console.error("Booking confirmation sendMessage failed:", await res.text());
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    const slotId =
      body && typeof body === "object"
        ? (body as { slotId?: unknown }).slotId
        : undefined;
    if (typeof slotId !== "string" || slotId.length === 0) {
      return badRequest("Slot tanlanmadi.");
    }

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();
    const { user, talent } = context;

    if (talent.status !== "test_otgan") {
      return conflict("Suhbat bron qilish faqat testdan so'ng ochiladi.");
    }

    // Conditional claim: loses cleanly if another talent takes the slot first.
    const claimed = await interviewSlotsRepo.claim(client, slotId);
    if (!claimed) {
      return NextResponse.json(
        { error: "Bu vaqt band bo'ldi. Boshqa vaqtni tanlang." },
        { status: 409 },
      );
    }

    await interviewsRepo.insert(client, {
      talent_id: talent.id,
      scheduled_at: claimed.starts_at,
    });
    await talentsRepo.setStatus(client, talent, "suhbat_belgilangan", user.id);

    if (user.tg_id) {
      // Non-fatal: booking succeeded even if the chat message fails.
      sendBookingConfirmation(user.tg_id, claimed.starts_at).catch((err) => {
        console.error("Booking confirmation failed:", err);
      });
    }

    return NextResponse.json({ scheduledAt: claimed.starts_at });
  } catch (err) {
    console.error("POST /api/booking failed:", err);
    return serverError();
  }
}
