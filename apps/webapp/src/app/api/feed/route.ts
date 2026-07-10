import { companiesRepo, talentsRepo } from "@talantly/shared";
import { NextResponse } from "next/server";
import type { FeedResponse } from "@/lib/apiTypes";
import { requireSession, serverError, unauthorized } from "@/lib/server/auth";
import { getSupabase } from "@/lib/server/supabase";
import {
  loadScoresAndRatings,
  toCard,
  toCompanySnapshot,
} from "@/lib/server/talentPublic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    const [company, verified] = await Promise.all([
      companiesRepo.findByUserId(client, session.userId),
      talentsRepo.listVerified(client),
    ]);
    const { scores, ratings } = await loadScoresAndRatings(
      client,
      verified.map((t) => t.id),
    );

    const payload: FeedResponse = {
      company: company ? toCompanySnapshot(company) : null,
      talents: verified.map((talent) =>
        toCard(
          talent,
          scores.get(talent.id) ?? null,
          ratings.get(talent.id) ?? null,
        ),
      ),
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/feed failed:", err);
    return serverError();
  }
}
