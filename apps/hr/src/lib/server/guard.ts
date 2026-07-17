import { redirect } from "next/navigation";
import { ensureCompany, type CompanyRow } from "./company";
import { getSession, type Session } from "./session";

/** Sessiya + kompaniya. Login qilmagan bo'lsa → /login. */
export async function requireCompany(): Promise<{
  session: Session;
  company: CompanyRow;
}> {
  const session = await getSession();
  if (!session) redirect("/login");
  const company = await ensureCompany(session);
  return { session, company };
}

export function companyLabel(c: CompanyRow): string {
  return c.name && c.name !== "Kompaniya" ? c.name : "Kompaniyangiz";
}
