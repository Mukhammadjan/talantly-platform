import { usersRepo, type PreferredMode } from "@talantly/shared";
import { NextResponse } from "next/server";
import {
  badRequest,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODES: PreferredMode[] = ["talant", "izlovchi"];

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const body: unknown = await request.json().catch(() => null);
    const mode =
      body && typeof body === "object"
        ? (body as { mode?: unknown }).mode
        : undefined;
    if (typeof mode !== "string" || !MODES.includes(mode as PreferredMode)) {
      return badRequest("Rol noto'g'ri.");
    }

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();

    await usersRepo.updateFields(client, context.user.id, {
      preferred_mode: mode as PreferredMode,
    });
    return NextResponse.json({ ok: true, mode });
  } catch (err) {
    console.error("POST /api/mode failed:", err);
    return serverError();
  }
}
