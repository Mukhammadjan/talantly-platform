import { AdminHeader } from "@/components/AdminHeader";
import { PersonCell, TableCard } from "@/components/admin/ui";
import { CompanyVerifyToggle } from "@/components/RowActions";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface CompanyRow {
  id: string;
  name: string | null;
  contact_name: string | null;
  phone_tg: string | null;
  city: string | null;
  is_verified: boolean;
  is_demo: boolean;
  created_at: string;
}

export default async function AdminKompaniyalarPage(): Promise<JSX.Element> {
  await requireAdminPage();
  const db = getDb();
  const { data } = await db
    .from("companies")
    .select(
      "id, name, contact_name, phone_tg, city, is_verified, is_demo, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as CompanyRow[];

  // Har kompaniya uchun aktiv obuna bormi
  const now = new Date().toISOString();
  const { data: subsData } = await db
    .from("contact_unlocks")
    .select("company_id")
    .eq("kind", "obuna")
    .eq("status", "tasdiqlangan")
    .gte("expires_at", now);
  const subIds = new Set(
    ((subsData ?? []) as { company_id: string | null }[]).map(
      (s) => s.company_id,
    ),
  );

  return (
    <>
      <AdminHeader title="Kompaniyalar" crumb="Dashboard" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto">
          <TableCard title="Barcha kompaniyalar" count={`${rows.length} ta`}>
            {rows.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-ink-2">
                Hali kompaniya yo&apos;q.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <th className="px-4 py-3 font-semibold rounded-l-lg">
                        Kompaniya
                      </th>
                      <th className="px-4 py-3 font-semibold">Aloqa</th>
                      <th className="px-4 py-3 font-semibold">Shahar</th>
                      <th className="px-4 py-3 font-semibold">Obuna</th>
                      <th className="px-4 py-3 font-semibold">Sana</th>
                      <th className="px-4 py-3 font-semibold rounded-r-lg text-right">
                        Tekshiruv
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c, i) => (
                      <tr key={c.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3.5">
                          <PersonCell
                            name={c.name ?? "—"}
                            sub={c.is_demo ? "Demo" : null}
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="block text-[14px] text-ink-1">
                            {c.contact_name ?? "—"}
                          </span>
                          <span className="block text-[12px] text-ink-2">
                            {c.phone_tg ?? ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-ink-2">
                          {c.city ?? "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          {subIds.has(c.id) ? (
                            <span className="inline-block rounded-full bg-verified-soft text-verified-ink px-3 py-1 text-[12px] font-bold">
                              Obuna faol
                            </span>
                          ) : (
                            <span className="text-[13px] text-ink-3">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-ink-2 tabular-nums">
                          {new Date(c.created_at).toLocaleDateString("uz-UZ")}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <CompanyVerifyToggle
                            companyId={c.id}
                            isVerified={c.is_verified}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TableCard>
        </div>
      </main>
    </>
  );
}
