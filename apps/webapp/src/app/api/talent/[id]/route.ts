import {
  companiesRepo,
  cvProfilesRepo,
  requestsRepo,
  talentsRepo,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import type { TalentDetailPublic } from "@/lib/apiTypes";
import {
  notFound,
  requireSession,
  serverError,
  unauthorized,
} from "@/lib/server/auth";
import { getSupabase } from "@/lib/server/supabase";
import { loadScoresAndRatings, toCard } from "@/lib/server/talentPublic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    const talent = await talentsRepo.findById(client, params.id);
    // Only verified talents are visible to guests.
    if (!talent || talent.status !== "tekshirilgan") {
      return notFound("Nomzod topilmadi.");
    }

    const [company, cv, { scores, ratings }] = await Promise.all([
      companiesRepo.findByUserId(client, session.userId),
      cvProfilesRepo.findByTalentId(client, talent.id),
      loadScoresAndRatings(client, [talent.id]),
    ]);

    let requested = false;
    if (company) {
      const open = await requestsRepo.findOpenCompanyRequest(
        client,
        company.id,
        talent.id,
      );
      requested = Boolean(open);
    }

    const card = toCard(
      talent,
      scores.get(talent.id) ?? null,
      ratings.get(talent.id) ?? null,
    );
    const payload: TalentDetailPublic = {
      ...card,
      education: talent.education,
      experienceYears: talent.experience_years,
      traits: talent.personality?.traits ?? [],
      summary: cv?.summary ?? null,
      aiVerdict: cv?.ai_verdict ?? null,
      cvSkills: cv?.skills ?? [],
      requested,
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/talent/[id] failed:", err);
    return serverError();
  }
}
