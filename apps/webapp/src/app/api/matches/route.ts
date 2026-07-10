import {
  companiesRepo,
  requestsRepo,
  type CompanyRow,
  type TalentRow,
} from "@talantly/shared";
import { NextResponse } from "next/server";
import type { MatchPublic, MatchesResponse } from "@/lib/apiTypes";
import { requireSession, serverError, unauthorized } from "@/lib/server/auth";
import { loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function matchesTalent(company: CompanyRow, talent: TalentRow): boolean {
  if (!company.directions_needed?.length || !talent.direction) return false;
  if (!company.directions_needed.includes(talent.direction)) return false;
  if (
    company.needed_level &&
    talent.level &&
    company.needed_level !== "ikkalasi" &&
    company.needed_level !== talent.level
  ) {
    return false;
  }
  return true;
}

/** Company identity must never leak to the talent — no name, no logo. */
function toPublic(company: CompanyRow): MatchPublic {
  return {
    id: company.id,
    activityType: company.activity_type,
    city: company.city,
    neededLevel: company.needed_level,
    urgency: company.urgency,
    directions: company.directions_needed ?? [],
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();
    const { talent } = context;

    const companies = await companiesRepo.listAll(client);
    const matched = companies.filter((c) => matchesTalent(c, talent));
    // Same-city requests first, then most recent.
    matched.sort((a, b) => {
      const cityA = a.city && a.city === talent.city ? 0 : 1;
      const cityB = b.city && b.city === talent.city ? 0 : 1;
      if (cityA !== cityB) return cityA - cityB;
      return b.created_at.localeCompare(a.created_at);
    });

    const open = await requestsRepo.findOpenInterestByTalentId(
      client,
      talent.id,
    );

    const payload: MatchesResponse = {
      matches: matched.slice(0, 10).map(toPublic),
      interestSent: Boolean(open),
    };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("GET /api/matches failed:", err);
    return serverError();
  }
}
