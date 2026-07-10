import {
  companiesRepo,
  requestsRepo,
  statusLogRepo,
  talentsRepo,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  conflict,
  notFound,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { notifyAdmin } from "@/lib/server/notify";
import { getSupabase } from "@/lib/server/supabase";
import { guestDisplayName } from "@/lib/server/talentPublic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    const { talentId } = (body ?? {}) as { talentId?: unknown };
    if (typeof talentId !== "string" || !talentId) {
      return badRequest("Nomzod tanlanmagan.");
    }

    const client = getSupabase();
    const company = await companiesRepo.findByUserId(client, session.userId);
    if (!company) {
      return conflict("Avval izlovchi sifatida ro'yxatdan o'ting.");
    }
    const talent = await talentsRepo.findById(client, talentId);
    if (!talent || talent.status !== "tekshirilgan") {
      return notFound("Nomzod topilmadi.");
    }

    const open = await requestsRepo.findOpenCompanyRequest(
      client,
      company.id,
      talent.id,
    );
    if (open) {
      return NextResponse.json({ sent: true, already: true });
    }

    const created = await requestsRepo.insert(client, {
      kind: "kompaniya_sorovi",
      company_id: company.id,
      talent_id: talent.id,
      direction: talent.direction,
    });
    await statusLogRepo.insert(client, {
      entity: "request",
      entity_id: created.id,
      old_status: null,
      new_status: created.status,
      changed_by: session.userId,
    });

    await notifyAdmin(
      [
        "📩 Yangi nomzod so'rovi!",
        `🏢 Izlovchi: ${company.name}${company.city ? ` (${company.city})` : ""}`,
        `👤 Nomzod: ${guestDisplayName(talent.full_name)}`,
        `🧭 Yo'nalish: ${talent.direction ?? "-"}`,
      ].join("\n"),
    );

    return NextResponse.json({ sent: true, already: false });
  } catch (err) {
    console.error("POST /api/request failed:", err);
    return serverError();
  }
}
