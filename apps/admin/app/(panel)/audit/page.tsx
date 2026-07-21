import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { formatDateTimeUz } from "@/lib/format";

export const dynamic = "force-dynamic";

interface LogRow {
  id: string;
  entity: string;
  entity_id: string | null;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  created_at: string;
}

const ENTITY_LABEL: Record<string, string> = {
  talent: "Talant",
  payment: "To'lov",
  company: "Kompaniya",
  interview: "Suhbat",
  request: "So'rov",
  vacancy: "Vakansiya",
  user: "Foydalanuvchi",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { entity?: string };
}) {
  await requireRole("admin");
  const db = getServiceClient();

  let q = db
    .from("status_log")
    .select("id, entity, entity_id, old_status, new_status, changed_by, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (searchParams.entity) q = q.eq("entity", searchParams.entity);
  const { data } = await q;
  const rows = (data ?? []) as LogRow[];

  const entities = Object.keys(ENTITY_LABEL);

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-5">
        <h1 className="page-title">Audit log</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Har bir holat o&apos;zgarishi — kim, nima, qachon. Nizoda yagona
          haqiqat manbai.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/audit"
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
            !searchParams.entity
              ? "bg-orange-tint text-orange-ink"
              : "bg-surface text-ink-soft hover:bg-surface-2"
          }`}
        >
          Barchasi
        </Link>
        {entities.map((e) => (
          <Link
            key={e}
            href={`/audit?entity=${e}`}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              searchParams.entity === e
                ? "bg-orange-tint text-orange-ink"
                : "bg-surface text-ink-soft hover:bg-surface-2"
            }`}
          >
            {ENTITY_LABEL[e]}
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-[14px] text-ink-soft">
            Yozuv yo&apos;q.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="t-head">
                <th className="px-5 py-3">Obyekt</th>
                <th className="px-5 py-3">O&apos;zgarish</th>
                <th className="px-5 py-3">Kim</th>
                <th className="px-5 py-3 text-right">Sana</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="t-row">
                  <td className="px-5 py-3">
                    <span className="badge badge-gray">
                      {ENTITY_LABEL[r.entity] ?? r.entity}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px]">
                    {r.old_status ? (
                      <span className="text-ink-faint">{r.old_status} → </span>
                    ) : null}
                    <span className="font-semibold text-ink">
                      {r.new_status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-ink-soft">
                    {r.changed_by ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-[12px] text-ink-faint">
                    {formatDateTimeUz(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
