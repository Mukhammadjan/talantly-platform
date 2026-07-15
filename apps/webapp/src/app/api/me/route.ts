import { statusLogRepo, talentsRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { validateProfileEdit } from "@/lib/server/profileEdit";
import { buildSnapshot, loadSessionContext } from "@/lib/server/snapshot";
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

    const snapshot = await buildSnapshot(client, context.user, context.talent);
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("GET /api/me failed:", err);
    return serverError();
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    // Ownership: the talent id is bound in the signed session, never taken from
    // the request — a talent can only ever edit their own row.
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    const result = validateProfileEdit(body);
    if (!result.ok) return badRequest(result.error);

    const updated = await talentsRepo.updateFields(
      client,
      context.talent.id,
      result.fields,
    );
    // Audit every self-edit (guardrail #8: writes land in status_log).
    await statusLogRepo.insert(client, {
      entity: "talent",
      entity_id: context.talent.id,
      old_status: context.talent.status,
      new_status: context.talent.status,
      changed_by: session.userId,
    });

    const snapshot = await buildSnapshot(client, context.user, updated);
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error("PATCH /api/me failed:", err);
    return serverError();
  }
}
