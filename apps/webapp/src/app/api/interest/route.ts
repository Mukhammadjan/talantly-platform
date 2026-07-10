import { requestsRepo, statusLogRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  conflict,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { notifyAdmin } from "@/lib/server/notify";
import { loadSessionContext } from "@/lib/server/snapshot";
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

    if (talent.status !== "tekshirilgan") {
      return conflict(
        "Bu imkoniyat faqat tekshirilgan talantlar uchun ochiladi.",
      );
    }

    const open = await requestsRepo.findOpenInterestByTalentId(
      client,
      talent.id,
    );
    if (open) {
      return NextResponse.json({ sent: true, already: true });
    }

    const created = await requestsRepo.insert(client, {
      kind: "talant_qiziqishi",
      talent_id: talent.id,
      direction: talent.direction,
    });
    await statusLogRepo.insert(client, {
      entity: "request",
      entity_id: created.id,
      old_status: null,
      new_status: created.status,
      changed_by: user.id,
    });

    await notifyAdmin(
      [
        "🙋 Talant o'zini taklif qildi!",
        `👤 ${talent.full_name ?? "Noma'lum"}`,
        `🧭 Yo'nalish: ${talent.direction ?? "-"}`,
        `📍 Shahar: ${talent.city ?? "-"}`,
        `📱 Tel: ${user.phone ?? "-"}`,
      ].join("\n"),
    );

    return NextResponse.json({ sent: true, already: false });
  } catch (err) {
    console.error("POST /api/interest failed:", err);
    return serverError();
  }
}
