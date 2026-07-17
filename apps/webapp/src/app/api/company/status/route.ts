import { NextResponse } from "next/server";
import {
  ensureCompany,
  hasActiveSubscription,
} from "@/lib/server/companies";
import { requireUser } from "@/lib/server/guard";

export const dynamic = "force-dynamic";

/** Izlovchi holati: obuna faolmi, kompaniya tekshirilganmi (D14/F22 UI uchun). */
export async function GET(req: Request): Promise<NextResponse> {
  const g = await requireUser(req);
  if (!g.ok) return g.res;

  const company = await ensureCompany(g.session);
  return NextResponse.json({
    subscriptionActive: await hasActiveSubscription(company.id),
    isVerified: Boolean(company.is_verified),
  });
}
