import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";

export const dynamic = "force-dynamic";

// Ochiq (guest) kompaniyalar ro'yxati — auth talab qilinmaydi.
// Demo toggle settings'dan; har kompaniyaning ochiq (faol) vakansiyalari soni bilan.

interface CompanyRow {
  id: string;
  name: string;
  activity_type: string | null;
  city: string | null;
  district: string | null;
  description: string | null;
  logo_url: string | null;
  directions_needed: string[] | null;
  is_verified: boolean;
  is_demo: boolean;
  created_at: string;
}

function toView(c: CompanyRow, openCount: number): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    verified: c.is_verified,
    logoUrl: c.logo_url,
    activity: c.activity_type ?? "",
    city: c.city ?? "",
    district: c.district ?? "",
    about: (c.description ?? "").trim(),
    directions: c.directions_needed ?? [],
    openVacancies: openCount,
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const direction = url.searchParams.get("direction");
  const search = (url.searchParams.get("search") ?? "").trim();

  const db = getDb();
  const demoOn = await showDemo();

  let q = db
    .from("companies")
    .select(
      "id, name, activity_type, city, district, description, logo_url, directions_needed, is_verified, is_demo, created_at",
    );
  if (!demoOn) q = q.eq("is_demo", false);
  if (direction) q = q.contains("directions_needed", [direction]);
  if (search) {
    const s = search.replace(/[%,]/g, "");
    q = q.or(`name.ilike.%${s}%,activity_type.ilike.%${s}%`);
  }
  q = q.order("is_verified", { ascending: false }).limit(60);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  const rows = (data ?? []) as unknown as CompanyRow[];

  // Har kompaniyaning ochiq (faol) vakansiyalari sonini bir so'rovда yig'amiz.
  const ids = rows.map((r) => r.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    let vq = db
      .from("vacancies")
      .select("company_id")
      .eq("status", "faol")
      .in("company_id", ids);
    if (!demoOn) vq = vq.eq("is_demo", false);
    const { data: vac } = await vq;
    for (const v of (vac ?? []) as { company_id: string }[]) {
      counts.set(v.company_id, (counts.get(v.company_id) ?? 0) + 1);
    }
  }

  // Vakansiyasi bori tepada, keyin tekshirilgan, keyin nomi bo'yicha.
  const companies = rows
    .map((c) => toView(c, counts.get(c.id) ?? 0))
    .sort((a, b) => {
      const av = a.openVacancies as number;
      const bv = b.openVacancies as number;
      if (bv !== av) return bv - av;
      return Number(b.verified) - Number(a.verified);
    });
  return NextResponse.json({ companies, total: companies.length });
}
