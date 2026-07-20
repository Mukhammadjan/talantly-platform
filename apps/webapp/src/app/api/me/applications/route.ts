import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";
import { ensureTalent } from "@/lib/server/talents";

export const dynamic = "force-dynamic";

// Sessiya egasi (talant)ning arizalari — vakansiyaga qiziqishlar.

interface RequestRow {
  id: string;
  status: string;
  created_at: string;
  vacancies: { id: string; title: string } | null;
  companies: { name: string; logo_url: string | null; is_verified: boolean } | null;
}

export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const talent = await ensureTalent(g.session);
  const db = getDb();
  const { data, error } = await db
    .from("requests")
    .select(
      "id, status, created_at, vacancies(id, title), companies(name, logo_url, is_verified)",
    )
    .eq("kind", "talant_qiziqishi")
    .eq("talent_id", talent.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const applications = ((data ?? []) as unknown as RequestRow[]).map((r) => ({
    id: r.id,
    status: r.status,
    createdAt: r.created_at,
    vacancyId: r.vacancies?.id ?? null,
    vacancyTitle: r.vacancies?.title ?? "Vakansiya",
    company: r.companies?.name ?? "Kompaniya",
    logoUrl: r.companies?.logo_url ?? null,
    verified: r.companies?.is_verified ?? false,
  }));
  return NextResponse.json({ applications });
}
