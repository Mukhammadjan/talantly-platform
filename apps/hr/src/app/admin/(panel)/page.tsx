import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import {
  DIRECTION_LABELS,
  GaugeDonut,
  LineChart,
  PersonCell,
  StatusPill,
  TableCard,
} from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const DAYS = 30;

interface TalentRow {
  id: string;
  full_name: string | null;
  status: string;
  direction: string | null;
  city: string | null;
  is_demo: boolean;
  created_at: string;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

async function loadData(): Promise<{
  totalTalents: number;
  realTalents: number;
  verified: number;
  pending: number;
  complaints: number;
  labels: string[];
  createdSeries: number[];
  verifiedSeries: number[];
  byDirection: { label: string; value: number; color: string }[];
  latest: TalentRow[];
}> {
  const db = getDb();
  const since = new Date(Date.now() - DAYS * 24 * 3600 * 1000);
  const [talents, payments, unlocks, complaints, verifiedLog] =
    await Promise.all([
      db
        .from("talents")
        .select("id, full_name, status, direction, city, is_demo, created_at")
        .order("created_at", { ascending: false }),
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
        .from("status_log")
        .select("created_at")
        .eq("entity", "talents")
        .eq("new_status", "tekshirilgan")
        .gte("created_at", since.toISOString()),
    ]);

  const rows = (talents.data ?? []) as TalentRow[];

  // Oxirgi 30 kun kalitlari
  const labels: string[] = [];
  const keys: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000);
    keys.push(d.toISOString().slice(0, 10));
    labels.push(
      d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }),
    );
  }
  const createdMap = new Map<string, number>();
  for (const t of rows) {
    const k = dayKey(t.created_at);
    createdMap.set(k, (createdMap.get(k) ?? 0) + 1);
  }
  const verifiedMap = new Map<string, number>();
  for (const l of (verifiedLog.data ?? []) as { created_at: string }[]) {
    const k = dayKey(l.created_at);
    verifiedMap.set(k, (verifiedMap.get(k) ?? 0) + 1);
  }

  const dirCounts = new Map<string, number>();
  for (const t of rows) {
    const d0 = t.direction ?? "boshqa";
    dirCounts.set(d0, (dirCounts.get(d0) ?? 0) + 1);
  }
  const DIR_COLORS = [
    "var(--t-action)",
    "var(--t-verified)",
    "var(--t-ink-1)",
    "var(--t-danger)",
    "var(--t-ink-3)",
    "var(--t-line-strong)",
  ];
  const byDirection = [...dirCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([d0, v], i) => ({
      label: DIRECTION_LABELS[d0] ?? d0,
      value: v,
      color: DIR_COLORS[i % DIR_COLORS.length] ?? "var(--t-ink-3)",
    }));

  return {
    totalTalents: rows.length,
    realTalents: rows.filter((r) => !r.is_demo).length,
    verified: rows.filter((r) => r.status === "tekshirilgan").length,
    pending: (payments.count ?? 0) + (unlocks.count ?? 0),
    complaints: complaints.count ?? 0,
    labels,
    createdSeries: keys.map((k) => createdMap.get(k) ?? 0),
    verifiedSeries: keys.map((k) => verifiedMap.get(k) ?? 0),
    byDirection,
    latest: rows.slice(0, 6),
  };
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function KpiCard({
  value,
  label,
  tone,
  icon,
  href,
}: {
  value: number;
  label: string;
  tone: "action" | "verified" | "danger" | "ink";
  icon: JSX.Element;
  href?: string;
}): JSX.Element {
  const toneCls = {
    action: "bg-action-soft text-action-ink",
    verified: "bg-verified-soft text-verified-ink",
    danger: "bg-danger-soft text-danger-ink",
    ink: "bg-fill text-ink-1",
  }[tone];
  const inner = (
    <div className="bg-white rounded-2xl border border-line p-5 flex items-center gap-4 transition-colors hover:border-action/50">
      <span
        className={`w-[52px] h-[52px] rounded-xl grid place-items-center shrink-0 ${toneCls}`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-[28px] leading-8 font-bold text-ink-1 tabular-nums">
          {value.toLocaleString("ru-RU")}
        </span>
        <span className="block text-[13px] font-medium text-ink-2 mt-0.5">
          {label}
        </span>
      </span>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboardPage(): Promise<JSX.Element> {
  await requireAdminPage();
  const d = await loadData();

  return (
    <>
      <AdminHeader title="Dashboard" pendingCount={d.pending + d.complaints} />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto flex flex-col gap-5">
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              value={d.totalTalents}
              label={`Umumiy talantlar (real: ${d.realTalents})`}
              tone="ink"
              href="/admin/talantlar"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
                  <circle cx="9" cy="8" r="3.5" />
                  <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M15.5 5.2a3.5 3.5 0 0 1 0 6.6M17.5 19.5a5.5 5.5 0 0 0-2-4.3" />
                </svg>
              }
            />
            <KpiCard
              value={d.verified}
              label="Tekshirilgan talantlar"
              tone="verified"
              href="/admin/talantlar?status=tekshirilgan"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
                  <path d="M12 3.5 4.5 6.8v4.4c0 4.6 3.2 7.9 7.5 9.3 4.3-1.4 7.5-4.7 7.5-9.3V6.8L12 3.5z" />
                  <path d="m9.3 11.8 2 2 3.4-3.6" />
                </svg>
              }
            />
            <KpiCard
              value={d.pending}
              label="Kutilayotgan to'lovlar"
              tone="action"
              href="/admin/tolovlar"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
                  <rect x="3" y="6" width="18" height="13" rx="2.5" />
                  <path d="M3 10.5h18M7 15h4" />
                </svg>
              }
            />
            <KpiCard
              value={d.complaints}
              label="Yangi shikoyatlar"
              tone="danger"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" {...stroke}>
                  <path d="M12 8.5v4.5M12 16.5v.01" />
                  <path d="M10.3 4.6 3.6 16.2a2 2 0 0 0 1.7 3h13.4a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z" />
                </svg>
              }
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
            <TableCard title="Talantlar dinamikasi" count={`Oxirgi ${DAYS} kun`}>
              <LineChart
                labels={d.labels}
                series={[
                  {
                    label: "Yangi talantlar",
                    color: "var(--t-action)",
                    points: d.createdSeries,
                  },
                  {
                    label: "Tekshirilganlar",
                    color: "var(--t-verified)",
                    points: d.verifiedSeries,
                  },
                ]}
              />
            </TableCard>

            <TableCard title="Yo'nalish bo'yicha">
              <GaugeDonut
                total={String(d.totalTalents)}
                totalLabel="Barcha talantlar"
                parts={d.byDirection}
              />
            </TableCard>
          </section>

          <TableCard
            title="So'nggi talantlar"
            count={`${d.totalTalents} ta talant`}
            right={
              <Link
                href="/admin/talantlar"
                className="h-10 px-4 rounded-lg bg-fill text-ink-1 text-[13px] font-bold grid place-items-center hover:bg-line transition-colors"
              >
                Barchasini ko&apos;rish
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                    <th className="px-4 py-3 font-semibold rounded-l-lg">
                      Talant
                    </th>
                    <th className="px-4 py-3 font-semibold">Holat</th>
                    <th className="px-4 py-3 font-semibold">Yo&apos;nalish</th>
                    <th className="px-4 py-3 font-semibold">Shahar</th>
                    <th className="px-4 py-3 font-semibold rounded-r-lg">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {d.latest.map((t, i) => (
                    <tr key={t.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                      <td className="px-4 py-3">
                        <Link href={`/admin/talantlar/${t.id}`}>
                          <PersonCell
                            name={t.full_name ?? "—"}
                            sub={t.is_demo ? "Demo" : null}
                          />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="px-4 py-3 text-[14px] text-ink-1">
                        {DIRECTION_LABELS[t.direction ?? ""] ?? t.direction ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[14px] text-ink-2">
                        {t.city ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums">
                        {new Date(t.created_at).toLocaleDateString("uz-UZ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCard>
        </div>
      </main>
    </>
  );
}
