import Link from "next/link";
import type { TalentStatus } from "@talantly/shared";
import {
  companiesRepo,
  placementsRepo,
  requestsRepo,
  talentsRepo,
} from "@talantly/shared";
import { Tag } from "@/components/chips";
import {
  COMPANY_STATUS_LABELS,
  DIRECTION_LABELS,
  NEEDED_LEVEL_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";
import { DemoModeControl } from "../sozlamalar/DemoModeControl";
import { loadDemoMode } from "../sozlamalar/demoActions";

export const dynamic = "force-dynamic";

const FUNNEL_STATUSES: TalentStatus[] = [
  "yangi",
  "malumot_toldirilgan",
  "tolov_tasdiqlangan",
  "cv_tayyor",
  "test_otgan",
  "suhbat_belgilangan",
  "tekshirilgan",
];

export default async function DashboardPage() {
  const client = getServiceClient();
  const [talents, companies, requests, placements, demoMode] = await Promise.all([
    talentsRepo.listAll(client),
    companiesRepo.listAll(client),
    requestsRepo.listWithRelations(client),
    placementsRepo.listAll(client),
    loadDemoMode(),
  ]);

  const verifiedCount = talents.filter(
    (t) => t.status === "tekshirilgan",
  ).length;
  const activeRequests = requests.filter((r) => r.status !== "yopildi");
  const urgentCompanies = companies.filter((c) => c.urgency === "hoziroq");

  // Kutayotgan ishlar (navbat qisqa ko'rinishi — §3.1).
  const [{ count: pendingPayments }, { count: openComplaints }] =
    await Promise.all([
      client
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "kutilmoqda"),
      client
        .from("complaints")
        .select("id", { count: "exact", head: true })
        .neq("status", "hal_qilindi"),
    ]);
  const reviewQueue = talents.filter((t) =>
    ["cv_tayyor", "test_otgan", "suhbat_belgilangan"].includes(t.status),
  ).length;

  const queues = [
    { label: "Tekshiruv navbati", value: reviewQueue, href: "/tekshiruv" },
    { label: "To'lov tasdiqlash", value: pendingPayments ?? 0, href: "/tolovlar" },
    { label: "Ochiq shikoyatlar", value: openComplaints ?? 0, href: "/shikoyatlar" },
  ];

  // Cumulative funnel: everyone at stage N has passed all earlier stages.
  // tolov_kutilmoqda counts as malumot_toldirilgan; rad_etilgan is excluded.
  const stageIndex = (status: TalentStatus): number => {
    if (status === "rad_etilgan") return -1;
    if (status === "tolov_kutilmoqda") {
      return STATUS_ORDER.indexOf("malumot_toldirilgan");
    }
    return STATUS_ORDER.indexOf(status);
  };
  const reachedCount = (status: TalentStatus): number => {
    const idx = STATUS_ORDER.indexOf(status);
    return talents.filter((t) => {
      const tIdx = stageIndex(t.status);
      return tIdx >= 0 && tIdx >= idx;
    }).length;
  };
  const funnelMax = Math.max(reachedCount("yangi"), 1);

  const counters = [
    { label: "Ro'yxatdan o'tgan", value: talents.length, href: "/talantlar" },
    {
      label: "Tekshirilgan",
      value: verifiedCount,
      href: "/talantlar?status=tekshirilgan",
      accent: "green" as const,
    },
    { label: "Faol so'rovlar", value: activeRequests.length, href: "/sorovlar" },
    { label: "Joylashuvlar", value: placements.length, href: "/statistika" },
  ];

  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="mb-6 text-[24px] font-bold text-ink">Boshqaruv</h1>

      <div className="mb-6">
        <DemoModeControl initial={demoMode} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {counters.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="card p-5 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <p className="label-caps">{c.label}</p>
            <p
              className={`mt-2 text-[32px] font-bold leading-none ${
                c.accent === "green" ? "text-green-deep" : "text-ink"
              }`}
            >
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="mb-6">
        <p className="label-caps mb-2">Kutayotgan ishlar</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {queues.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="card flex items-center justify-between p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-[14px] font-semibold text-ink">
                {q.label}
              </span>
              <span
                className={`flex items-center gap-2 text-[24px] font-bold ${
                  q.value > 0 ? "text-orange-ink" : "text-ink-faint"
                }`}
              >
                {q.value}
                {q.value > 0 ? (
                  <span className="h-2 w-2 rounded-full bg-orange" />
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="card p-5 shadow-soft">
          <h2 className="mb-4 text-[15px] font-bold text-ink">
            Tekshiruv voronkasi
          </h2>
          <div className="grid gap-2.5">
            {FUNNEL_STATUSES.map((status) => {
              const count = reachedCount(status);
              const pct = Math.round((count / funnelMax) * 100);
              const isVerified = status === "tekshirilgan";
              return (
                <div key={status} className="grid gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] text-ink-soft">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-[13px] font-semibold text-ink">
                      {count}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-cream">
                    <div
                      className={`h-full rounded-full ${
                        isVerified ? "bg-green" : "bg-orange"
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-5 shadow-soft">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[15px] font-bold text-ink">
              Hoziroq kerak
            </h2>
            <Link
              href="/izlovchilar"
              className="text-[13px] font-semibold text-orange"
            >
              Hammasi →
            </Link>
          </div>
          {urgentCompanies.length === 0 ? (
            <p className="text-[13px] text-ink-faint">
              Shoshilinch izlovchilar yo'q.
            </p>
          ) : (
            <ul className="grid gap-3">
              {urgentCompanies.map((c) => (
                <li
                  key={c.id}
                  className="rounded-[14px] border border-line p-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[14px] font-semibold text-ink">
                      {c.name}
                    </p>
                    <span className="text-[12px] text-ink-faint">
                      {COMPANY_STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(c.directions_needed ?? []).map((d) => (
                      <Tag key={d}>
                        {DIRECTION_LABELS[d as keyof typeof DIRECTION_LABELS] ??
                          d}
                      </Tag>
                    ))}
                    {c.needed_level ? (
                      <Tag>{NEEDED_LEVEL_LABELS[c.needed_level]}</Tag>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
