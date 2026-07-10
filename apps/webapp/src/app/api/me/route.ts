import { NextResponse } from "next/server";
import { requireSession, serverError, unauthorized } from "@/lib/server/auth";
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
