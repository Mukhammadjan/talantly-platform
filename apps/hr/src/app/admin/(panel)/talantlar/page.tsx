import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  yangi: "Yangi",
  malumot_toldirilgan: "Ma'lumot",
  tolov_kutilmoqda: "To'lov kutilmoqda",
  tolov_tasdiqlangan: "To'lov OK",
  cv_tayyor: "CV tayyor",
  test_otgan: "Test o'tgan",
  suhbat_belgilangan: "Suhbat",
  tekshirilgan: "Tekshirilgan",
  rad_etilgan: "Rad",
  band: "Band",
};

const STATUS_STYLE: Record<string, string> = {
  tekshirilgan: "bg-verified-soft text-verified-ink",
  rad_etilgan: "bg-danger-soft text-danger-ink",
  band: "bg-fill text-ink-2",
  tolov_kutilmoqda: "bg-action-soft text-action-ink",
};

interface TalentListRow {
  id: string;
  full_name: string | null;
  status: string;
  direction: string | null;
  city: string | null;
  is_demo: boolean;
  is_hidden: boolean;
  created_at: string;
}

export default async function AdminTalantlarPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}): Promise<JSX.Element> {
  await requireAdminPage();
  const db = getDb();

  let query = db
    .from("talents")
    .select("id, full_name, status, direction, city, is_demo, is_hidden, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.q) {
    const s = searchParams.q.replace(/[%,]/g, "");
    query = query.ilike("full_name", `%${s}%`);
  }
  const { data } = await query;
  const rows = (data ?? []) as TalentListRow[];

  return (
    <>
      <AdminHeader title="Talantlar" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-shell mx-auto flex flex-col gap-4">
          <form className="flex gap-2" action="/admin/talantlar" method="get">
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder="Ism bo'yicha qidirish"
              className="h-11 flex-1 max-w-[320px] rounded-lg border border-line-strong bg-white px-4 text-[14px] text-ink-1 placeholder:text-ink-2 focus:outline-none focus:border-action"
            />
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
            <button
              type="submit"
              className="h-11 px-5 rounded-lg bg-ink-1 text-white text-[14px] font-bold hover:bg-ink-nav transition-colors"
            >
              Qidirish
            </button>
          </form>

          <div className="bg-white rounded-xl border border-line overflow-hidden">
            {rows.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-ink-2">
                Talant topilmadi.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line text-[12px] uppercase tracking-wide text-ink-2">
                    <th className="px-5 py-3 font-semibold">Ism</th>
                    <th className="px-3 py-3 font-semibold">Holat</th>
                    <th className="px-3 py-3 font-semibold">Yo&apos;nalish</th>
                    <th className="px-3 py-3 font-semibold">Shahar</th>
                    <th className="px-3 py-3 font-semibold">Belgi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-b border-line last:border-0 hover:bg-bg">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/talantlar/${t.id}`}
                          className="text-[14px] font-semibold text-ink-1 hover:text-action-ink"
                        >
                          {t.full_name ?? "—"}
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                            STATUS_STYLE[t.status] ?? "bg-fill text-ink-1"
                          }`}
                        >
                          {STATUS_LABELS[t.status] ?? t.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[14px] text-ink-2">
                        {t.direction ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-[14px] text-ink-2">
                        {t.city ?? "—"}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-3">
                        {t.is_demo ? "DEMO " : ""}
                        {t.is_hidden ? "· yashirin" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
