import { NextResponse } from "next/server";
import { ensureCompany } from "@/lib/server/companies";
import { getDb } from "@/lib/server/db";
import { requireUser } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

interface ReqRow {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
  talent_id: string;
  talents: {
    id: string;
    full_name: string | null;
    direction: string | null;
    city: string | null;
    status: string;
  } | null;
}

/** Familiyani bosh harfga qisqartiramiz — to'liq kontakt unlock orqali (E-model). */
function shortName(full: string | null): string {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "Nomzod";
  const second = parts[1];
  if (!second) return first;
  return `${first} ${second.charAt(0).toUpperCase()}.`;
}

/** Shu vakansiyaga kelgan arizalar — faqat vakansiya egasiga. */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const db = getDb();
  const company = await ensureCompany(g.session);

  const { data: vacancy } = await db
    .from("vacancies")
    .select("id, company_id, title")
    .eq("id", params.id)
    .maybeSingle();
  const v = vacancy as { id: string; company_id: string; title: string } | null;
  if (!v) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (v.company_id !== company.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { data, error } = await db
    .from("requests")
    .select(
      "id, status, note, created_at, talent_id, talents(id, full_name, direction, city, status)",
    )
    .eq("kind", "talant_qiziqishi")
    .eq("vacancy_id", v.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const rows = (data ?? []) as unknown as ReqRow[];
  return NextResponse.json({
    vacancy: { id: v.id, title: v.title },
    applications: rows.map((r) => ({
      id: r.id,
      status: r.status,
      note: r.note ?? "",
      createdAt: r.created_at,
      talent: {
        id: r.talent_id,
        name: shortName(r.talents?.full_name ?? null),
        direction: r.talents?.direction ?? "",
        city: r.talents?.city ?? "",
        verified: r.talents?.status === "tekshirilgan",
      },
    })),
  });
}
