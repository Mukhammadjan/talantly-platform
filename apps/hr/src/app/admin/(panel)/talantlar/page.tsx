import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import {
  DIRECTION_LABELS,
  PersonCell,
  STATUS_LABELS,
  StatusPill,
  TableCard,
} from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

interface TalentListRow {
  id: string;
  full_name: string | null;
  status: string;
  direction: string | null;
  level: string | null;
  city: string | null;
  is_demo: boolean;
  is_hidden: boolean;
  created_at: string;
}

function pageHref(
  params: { status?: string; q?: string },
  page: number,
): string {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return `/admin/talantlar${qs ? `?${qs}` : ""}`;
}

export default async function AdminTalantlarPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string };
}): Promise<JSX.Element> {
  await requireAdminPage();
  const db = getDb();
  const page = Math.max(1, Number(searchParams.page) || 1);

  let query = db
    .from("talents")
    .select(
      "id, full_name, status, direction, level, city, is_demo, is_hidden, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.q) {
    const s = searchParams.q.replace(/[%,]/g, "");
    query = query.ilike("full_name", `%${s}%`);
  }
  const { data, count } = await query;
  const rows = (data ?? []) as TalentListRow[];
  const total = count ?? rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageList = Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1);

  return (
    <>
      <AdminHeader title="Talantlar" crumb="Dashboard" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto">
          <TableCard
            title="Barcha talantlar"
            count={`${total} ta talant`}
            right={
              <form
                className="flex items-center gap-2"
                action="/admin/talantlar"
                method="get"
              >
                <select
                  name="status"
                  defaultValue={searchParams.status ?? ""}
                  className="h-11 rounded-lg border border-line-strong bg-white px-3 text-[14px] text-ink-1"
                >
                  <option value="">Barcha holatlar</option>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 h-11 rounded-lg border border-line-strong bg-white px-3.5 w-[220px] focus-within:border-action">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-ink-2 shrink-0"
                  >
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                  <input
                    name="q"
                    defaultValue={searchParams.q ?? ""}
                    placeholder="Izlash"
                    className="flex-1 min-w-0 outline-none text-[14px] text-ink-1 placeholder:text-ink-2 bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-5 rounded-lg bg-ink-1 text-white text-[14px] font-bold hover:bg-ink-nav transition-colors"
                >
                  Qidirish
                </button>
              </form>
            }
          >
            {rows.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-ink-2">
                Talant topilmadi.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <th className="px-4 py-3 font-semibold rounded-l-lg">№</th>
                      <th className="px-4 py-3 font-semibold">Talant</th>
                      <th className="px-4 py-3 font-semibold">Holat</th>
                      <th className="px-4 py-3 font-semibold">Yo&apos;nalish</th>
                      <th className="px-4 py-3 font-semibold">Daraja</th>
                      <th className="px-4 py-3 font-semibold">Shahar</th>
                      <th className="px-4 py-3 font-semibold rounded-r-lg">
                        Sana
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((t, i) => (
                      <tr key={t.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3.5 text-[14px] text-ink-2 tabular-nums">
                          {(page - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <Link href={`/admin/talantlar/${t.id}`}>
                            <PersonCell
                              name={t.full_name ?? "—"}
                              sub={
                                [
                                  t.is_demo ? "Demo" : null,
                                  t.is_hidden ? "Yashirin" : null,
                                ]
                                  .filter(Boolean)
                                  .join(" · ") || null
                              }
                            />
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusPill status={t.status} />
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-ink-1">
                          {DIRECTION_LABELS[t.direction ?? ""] ??
                            t.direction ??
                            "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-ink-2 capitalize">
                          {t.level ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[14px] text-ink-2">
                          {t.city ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-ink-2 tabular-nums whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString("uz-UZ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 ? (
              <div className="flex items-center justify-center gap-1.5 mt-5">
                <Link
                  href={pageHref(searchParams, Math.max(1, page - 1))}
                  className="w-10 h-10 rounded-lg border border-line grid place-items-center text-ink-1 hover:bg-fill"
                  aria-label="Oldingi"
                >
                  ‹
                </Link>
                {pageList.map((p) => (
                  <Link
                    key={p}
                    href={pageHref(searchParams, p)}
                    className={`w-10 h-10 rounded-lg grid place-items-center text-[14px] font-bold ${
                      p === page
                        ? "bg-action text-white"
                        : "border border-line text-ink-1 hover:bg-fill"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                <Link
                  href={pageHref(searchParams, Math.min(pages, page + 1))}
                  className="w-10 h-10 rounded-lg border border-line grid place-items-center text-ink-1 hover:bg-fill"
                  aria-label="Keyingi"
                >
                  ›
                </Link>
              </div>
            ) : null}
          </TableCard>
        </div>
      </main>
    </>
  );
}
