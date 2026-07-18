import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  yangi: "Yangi",
  malumot_toldirilgan: "Ma'lumot to'ldirilgan",
  tolov_kutilmoqda: "To'lov kutilmoqda",
  tolov_tasdiqlangan: "To'lov tasdiqlangan",
  cv_tayyor: "CV tayyor",
  test_otgan: "Test o'tgan",
  suhbat_belgilangan: "Suhbat belgilangan",
  tekshirilgan: "Tekshirilgan",
  rad_etilgan: "Rad etilgan",
  band: "Band",
};

async function loadStats(): Promise<{
  byStatus: [string, number][];
  totalTalents: number;
  realTalents: number;
  pendingPayments: number;
  pendingUnlocks: number;
  newComplaints: number;
  upcomingInterviews: number;
}> {
  const db = getDb();
  const [talents, payments, unlocks, complaints, interviews] =
    await Promise.all([
      db.from("talents").select("status, is_demo"),
      db
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "kutilmoqda"),
      db
        .from("contact_unlocks")
        .select("id", { count: "exact", head: true })
        .eq("status", "kutilmoqda"),
      db
        .from("complaints")
        .select("id", { count: "exact", head: true })
        .eq("status", "yangi"),
      db
        .from("interviews")
        .select("id", { count: "exact", head: true })
        .is("decision", null)
        .gte("scheduled_at", new Date().toISOString()),
    ]);

  const rows = (talents.data ?? []) as { status: string; is_demo: boolean }[];
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
  const order = Object.keys(STATUS_LABELS);
  const byStatus = [...counts.entries()].sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );

  return {
    byStatus,
    totalTalents: rows.length,
    realTalents: rows.filter((r) => !r.is_demo).length,
    pendingPayments: payments.count ?? 0,
    pendingUnlocks: unlocks.count ?? 0,
    newComplaints: complaints.count ?? 0,
    upcomingInterviews: interviews.count ?? 0,
  };
}

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number;
  href?: string;
  accent?: boolean;
}): JSX.Element {
  const inner = (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        accent && value > 0
          ? "bg-action-soft border-action/30"
          : "bg-white border-line"
      } ${href ? "hover:border-action/60" : ""}`}
    >
      <p
        className={`text-[32px] leading-9 font-bold ${
          accent && value > 0 ? "text-action-ink" : "text-ink-1"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[13px] font-medium text-ink-2">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  await requireAdminPage();
  const s = await loadStats();

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-shell mx-auto flex flex-col gap-6">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Kutilayotgan to'lovlar"
              value={s.pendingPayments + s.pendingUnlocks}
              href="/admin/tolovlar"
              accent
            />
            <StatCard
              label="Yangi shikoyatlar"
              value={s.newComplaints}
              accent
            />
            <StatCard
              label="Yaqin suhbatlar"
              value={s.upcomingInterviews}
            />
            <StatCard
              label={`Talantlar (real: ${s.realTalents})`}
              value={s.totalTalents}
              href="/admin/talantlar"
            />
          </section>

          <section className="bg-white rounded-xl border border-line p-6">
            <h2 className="text-[15px] font-bold text-ink-1 mb-4">
              Talantlar holat bo&apos;yicha
            </h2>
            <div className="flex flex-col gap-2">
              {s.byStatus.map(([status, n]) => (
                <Link
                  key={status}
                  href={`/admin/talantlar?status=${status}`}
                  className="flex items-center justify-between h-11 px-4 rounded-lg bg-bg hover:bg-fill transition-colors"
                >
                  <span className="text-[14px] font-medium text-ink-1">
                    {STATUS_LABELS[status] ?? status}
                  </span>
                  <span className="text-[14px] font-bold text-ink-1 tabular-nums">
                    {n}
                  </span>
                </Link>
              ))}
              {s.byStatus.length === 0 ? (
                <p className="text-[14px] text-ink-2">Hali talant yo&apos;q.</p>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
