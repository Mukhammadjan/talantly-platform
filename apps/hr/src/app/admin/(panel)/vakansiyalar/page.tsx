import { AdminHeader } from "@/components/AdminHeader";
import { DIRECTION_LABELS, TableCard } from "@/components/admin/ui";
import { VacancyStatusToggle } from "@/components/RowActions";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface VacancyRow {
  id: string;
  company_id: string | null;
  title: string | null;
  direction: string | null;
  level: string | null;
  salary_from: number | null;
  salary_to: number | null;
  city: string | null;
  status: string;
  is_demo: boolean;
  created_at: string;
}

export default async function AdminVakansiyalarPage(): Promise<JSX.Element> {
  await requireAdminPage();
  const db = getDb();
  const { data } = await db
    .from("vacancies")
    .select(
      "id, company_id, title, direction, level, salary_from, salary_to, city, status, is_demo, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as VacancyRow[];

  const companyIds = [...new Set(rows.map((r) => r.company_id).filter(Boolean))];
  const names = new Map<string, string>();
  if (companyIds.length) {
    const { data: comps } = await db
      .from("companies")
      .select("id, name")
      .in("id", companyIds as string[]);
    for (const c of (comps ?? []) as { id: string; name: string | null }[]) {
      names.set(c.id, c.name ?? "—");
    }
  }

  const salary = (v: VacancyRow): string => {
    if (!v.salary_from && !v.salary_to) return "—";
    const f = v.salary_from ? v.salary_from.toLocaleString("ru-RU") : "";
    const t = v.salary_to ? v.salary_to.toLocaleString("ru-RU") : "";
    return f && t ? `${f}–${t}` : f || t;
  };

  return (
    <>
      <AdminHeader title="Vakansiyalar" crumb="Dashboard" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto">
          <TableCard title="Barcha vakansiyalar" count={`${rows.length} ta`}>
            {rows.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-ink-2">
                Hali vakansiya yo&apos;q.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <th className="px-4 py-3 font-semibold rounded-l-lg">
                        Vakansiya
                      </th>
                      <th className="px-4 py-3 font-semibold">Kompaniya</th>
                      <th className="px-4 py-3 font-semibold">Yo&apos;nalish</th>
                      <th className="px-4 py-3 font-semibold">Maosh (UZS)</th>
                      <th className="px-4 py-3 font-semibold">Holat</th>
                      <th className="px-4 py-3 font-semibold rounded-r-lg text-right">
                        Amal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((v, i) => (
                      <tr key={v.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3.5">
                          <span className="block text-[14px] font-semibold text-ink-1">
                            {v.title ?? "—"}
                            {v.is_demo ? (
                              <span className="ml-2 text-[10px] font-bold uppercase bg-fill text-ink-2 rounded px-1.5 py-0.5">
                                Demo
                              </span>
                            ) : null}
                          </span>
                          <span className="block text-[12px] text-ink-2">
                            {v.city ?? ""} {v.level ? `· ${v.level}` : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-ink-1">
                          {v.company_id ? names.get(v.company_id) ?? "—" : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-ink-2">
                          {DIRECTION_LABELS[v.direction ?? ""] ??
                            v.direction ??
                            "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] font-semibold text-ink-1 tabular-nums whitespace-nowrap">
                          {salary(v)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${
                              v.status === "faol"
                                ? "bg-verified-soft text-verified-ink"
                                : v.status === "yopilgan"
                                  ? "bg-danger-soft text-danger-ink"
                                  : "bg-fill text-ink-2"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <VacancyStatusToggle
                            vacancyId={v.id}
                            status={v.status}
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
