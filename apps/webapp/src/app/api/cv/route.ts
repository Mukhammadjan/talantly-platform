import { cvProfilesRepo, STORAGE_BUCKETS } from "@talantly/shared";
import { NextResponse } from "next/server";
import { requireSession, serverError, unauthorized } from "@/lib/server/auth";
import { loadSessionContext } from "@/lib/server/snapshot";
import { getSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNED_URL_TTL_SECONDS = 600;

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorized();

    const client = getSupabase();
    const context = await loadSessionContext(client, session);
    if (!context) return unauthorized();

    const cv = await cvProfilesRepo.findByTalentId(client, context.talent.id);
    if (!cv?.pdf_path) {
      return NextResponse.json(
        { error: "CV hali tayyor emas." },
        { status: 404 },
      );
    }

    const { data, error } = await client.storage
      .from(STORAGE_BUCKETS.cvPdfs)
      .createSignedUrl(cv.pdf_path, SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) {
      console.error("cv signed url failed:", error);
      return serverError();
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (err) {
    console.error("GET /api/cv failed:", err);
    return serverError();
  }
}
