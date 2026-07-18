import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { TableCard } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const ENTITIES = [
  { key: "", label: "Barchasi" },
  { key: "talents", label: "Talantlar" },
  { key: "payments", label: "To'lovlar" },
  { key: "contact_unlocks", label: "Kontaktlar" },
  { key: "interviews", label: "Suhbatlar" },
  { key: "complaints", label: "Shikoyatlar" },
  { key: "vacancies", label: "Vakansiyalar" },
];

interface LogRow {
  id: string;
  entity: string;
  entity_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  created_at: string;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: { entity?: string };
}): Promise<JSX.Element> {
  await requireAdminPage();
  const db = getDb();
  let q = db
    .from("status_log")
    .select("id, entity, entity_id, old_status, new_status, changed_by, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (searchParams.entity) q = q.eq("entity", searchParams.entity);
  const { data } = await q;
  const rows = (data ?? []) as LogRow[];

  // Talant nomlarini bitta so'rovda olamiz
  const talentIds = [
    ...new Set(
      rows.filter((r) => r.entity === "talents").map((r) => r.entity_id),
    ),
  ];
  const names = new Map<string, string>();
  if (talentIds.length) {
    const { data: ts } = await db
      .from("talents")
      .select("id, full_name")
      .in("id", talentIds);
    for (const t of (ts ?? []) as { id: string; full_name: string | null }[]) {
      names.set(t.id, t.full_name ?? "—");
    }
  }

  return (
    <>
      <AdminHeader title="Audit" crumb="Dashboard" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto">
          <TableCard
            title="Barcha o'zgarishlar"
            count="Oxirgi 100 ta yozuv"
            right={
              <div className="flex gap-1 flex-wrap">
                {ENTITIES.map((e) => (
                  <Link
                    key={e.key}
                    href={
                      e.key ? `/admin/audit?entity=${e.key}` : "/admin/audit"
                    }
                    className={`h-10 px-3.5 rounded-full grid place-items-center text-[13px] font-bold transition-colors ${
                      (searchParams.entity ?? "") === e.key
                        ? "bg-ink-1 text-white"
                        : "bg-fill text-ink-2 hover:text-ink-1"
                    }`}
                  >
                    {e.label}
                  </Link>
                ))}
              </div>
            }
          >
            {rows.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-ink-2">
                Yozuv yo&apos;q.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <th className="px-4 py-3 font-semibold rounded-l-lg">
                        Obyekt
                      </th>
                      <th className="px-4 py-3 font-semibold">O&apos;tish</th>
                      <th className="px-4 py-3 font-semibold">Kim</th>
                      <th className="px-4 py-3 font-semibold rounded-r-lg">
                        Vaqt
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((l, i) => (
                      <tr key={l.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3">
                          <span className="block text-[13px] font-bold text-ink-1">
                            {ENTITIES.find((e) => e.key === l.entity)?.label ??
                              l.entity}
                          </span>
                          <span className="block text-[12px] text-ink-2">
                            {l.entity === "talents"
                              ? names.get(l.entity_id) ?? l.entity_id.slice(0, 8)
                              : l.entity_id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[14px]">
                          <span className="text-ink-2">
                            {l.old_status ?? "—"}
                          </span>{" "}
                          <span className="text-ink-3">→</span>{" "}
                          <span className="font-semibold text-ink-1">
                            {l.new_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {l.changed_by ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums whitespace-nowrap">
                          {new Date(l.created_at).toLocaleString("uz-UZ", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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
