import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { CompanyVerifyToggle } from "@/components/RowActions";
import { DIRECTION_LABELS, TableCard } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface CompanyRow {
  id: string;
  user_id: string | null;
  name: string | null;
  kind: string | null;
  activity_type: string | null;
  city: string | null;
  district: string | null;
  description: string | null;
  contact_name: string | null;
  phone_tg: string | null;
  directions_needed: string[] | null;
  needed_level: string | null;
  urgency: string | null;
  is_verified: boolean;
  is_demo: boolean;
  created_at: string;
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoChip({ value, label }: { value: string; label: string }): JSX.Element {
  return (
    <div className="rounded-xl border border-line px-4 py-3 min-w-[110px]">
      <p className="text-[15px] font-bold text-ink-1">{value || "—"}</p>
      <p className="text-[12px] text-ink-2 mt-0.5">{label}</p>
    </div>
  );
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  await requireAdminPage();
  const db = getDb();

  const { data } = await db
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const company = data as CompanyRow | null;
  if (!company) notFound();

  const [userRes, vacsRes, unlocksRes, requestsRes] = await Promise.all([
    company.user_id
      ? db
          .from("users")
          .select("tg_id, username, is_blocked, created_at")
          .eq("id", company.user_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    db
      .from("vacancies")
      .select("id, title, direction, status, created_at")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false }),
    db
      .from("contact_unlocks")
      .select("id, talent_id, kind, amount, status, expires_at, created_at")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("requests")
      .select("id, kind, talent_id, status, created_at")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const user = userRes.data as {
    tg_id: number;
    username: string | null;
    is_blocked: boolean;
    created_at: string;
  } | null;
  const vacs = (vacsRes.data ?? []) as {
    id: string;
    title: string | null;
    direction: string | null;
    status: string;
    created_at: string;
  }[];
  const unlocks = (unlocksRes.data ?? []) as {
    id: string;
    talent_id: string | null;
    kind: string;
    amount: number;
    status: string;
    expires_at: string | null;
    created_at: string;
  }[];
  const requests = (requestsRes.data ?? []) as {
    id: string;
    kind: string;
    talent_id: string | null;
    status: string;
    created_at: string;
  }[];

  const talentIds = [
    ...new Set(
      [...unlocks, ...requests].map((r) => r.talent_id).filter(Boolean),
    ),
  ] as string[];
  const talentNames = new Map<string, string>();
  if (talentIds.length) {
    const { data: ts } = await db
      .from("talents")
      .select("id, full_name")
      .in("id", talentIds);
    for (const t of (ts ?? []) as { id: string; full_name: string | null }[]) {
      talentNames.set(t.id, t.full_name ?? "—");
    }
  }

  const now = Date.now();
  const activeSub = unlocks.some(
    (u) =>
      u.kind === "obuna" &&
      u.status === "tasdiqlangan" &&
      u.expires_at &&
      new Date(u.expires_at).getTime() > now,
  );

  return (
    <>
      <AdminHeader title={company.name ?? "Kompaniya"} crumb="Kompaniyalar" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto flex flex-col gap-5">
          <Link
            href="/admin/kompaniyalar"
            className="text-[13px] font-semibold text-ink-2 hover:text-ink-1 w-fit"
          >
            ← Kompaniyalar ro&apos;yxati
          </Link>

          <section className="bg-white rounded-2xl border border-line p-6">
            <div className="flex items-start gap-5 flex-wrap">
              <span className="w-[100px] h-[100px] rounded-2xl bg-action-soft text-action-ink grid place-items-center text-[36px] font-bold">
                {(company.name ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[24px] font-bold text-ink-1">
                    {company.name ?? "—"}
                  </h2>
                  {activeSub ? (
                    <span className="rounded-full bg-verified-soft text-verified-ink px-3 py-1 text-[12px] font-bold">
                      Obuna faol
                    </span>
                  ) : null}
                  {company.is_demo ? (
                    <span className="rounded-full bg-fill text-ink-2 px-2.5 py-0.5 text-[11px] font-bold uppercase">
                      Demo
                    </span>
                  ) : null}
                </div>
                <p className="text-[15px] text-ink-2 mt-1">
                  {company.activity_type ?? company.kind ?? ""}
                </p>
                <div className="flex gap-3 flex-wrap mt-4">
                  <InfoChip
                    value={company.contact_name ?? ""}
                    label="Aloqa shaxsi"
                  />
                  <InfoChip value={company.phone_tg ?? ""} label="Telefon/TG" />
                  <InfoChip
                    value={[company.city, company.district]
                      .filter(Boolean)
                      .join(" / ")}
                    label="Manzil"
                  />
                  <InfoChip
                    value={(company.directions_needed ?? [])
                      .map((d) => DIRECTION_LABELS[d] ?? d)
                      .join(", ")}
                    label="Kerak yo'nalishlar"
                  />
                  <InfoChip
                    value={company.needed_level ?? ""}
                    label="Kerak daraja"
                  />
                  <InfoChip
                    value={user ? String(user.tg_id) : ""}
                    label="Telegram ID"
                  />
                  <InfoChip
                    value={user?.username ? `@${user.username}` : ""}
                    label="Username"
                  />
                  <InfoChip
                    value={fmt(company.created_at).slice(0, 10)}
                    label="Qo'shilgan"
                  />
                </div>
              </div>
              <div className="shrink-0">
                <CompanyVerifyToggle
                  companyId={company.id}
                  isVerified={company.is_verified}
                />
              </div>
            </div>
            {company.description ? (
              <p className="text-[14px] leading-6 text-ink-2 mt-5 pt-5 border-t border-line">
                {company.description}
              </p>
            ) : null}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <TableCard title="Vakansiyalari" count={`${vacs.length} ta`}>
              {vacs.length === 0 ? (
                <p className="py-4 text-[14px] text-ink-2">
                  Vakansiya yo&apos;q.
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <th className="px-4 py-3 font-semibold rounded-l-lg">
                        Vakansiya
                      </th>
                      <th className="px-4 py-3 font-semibold">Yo&apos;nalish</th>
                      <th className="px-4 py-3 font-semibold rounded-r-lg">
                        Holat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacs.map((v, i) => (
                      <tr key={v.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[14px] font-semibold text-ink-1">
                          {v.title ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {DIRECTION_LABELS[v.direction ?? ""] ??
                            v.direction ??
                            "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${
                              v.status === "faol"
                                ? "bg-verified-soft text-verified-ink"
                                : "bg-fill text-ink-2"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableCard>

            <TableCard
              title="To'lovlar / kontakt ochishlar"
              count={`${unlocks.length} ta`}
            >
              {unlocks.length === 0 ? (
                <p className="py-4 text-[14px] text-ink-2">
                  Hali to&apos;lov yo&apos;q.
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <th className="px-4 py-3 font-semibold rounded-l-lg">
                        Talant
                      </th>
                      <th className="px-4 py-3 font-semibold">Turi</th>
                      <th className="px-4 py-3 font-semibold">Summa</th>
                      <th className="px-4 py-3 font-semibold rounded-r-lg">
                        Holat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {unlocks.map((u, i) => (
                      <tr key={u.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[13px] font-semibold text-ink-1">
                          {u.talent_id
                            ? talentNames.get(u.talent_id) ?? "—"
                            : u.kind === "obuna"
                              ? "Obuna"
                              : "—"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {u.kind}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-bold text-ink-1 tabular-nums">
                          {u.amount.toLocaleString("ru-RU")} UZS
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${
                              u.status === "tasdiqlangan"
                                ? "bg-verified-soft text-verified-ink"
                                : u.status === "rad"
                                  ? "bg-danger-soft text-danger-ink"
                                  : "bg-fill text-ink-2"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableCard>
          </div>

          <TableCard title="So'rovlari" count={`${requests.length} ta`}>
            {requests.length === 0 ? (
              <p className="py-4 text-[14px] text-ink-2">
                Hali so&apos;rov yo&apos;q.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                    <th className="px-4 py-3 font-semibold rounded-l-lg">
                      Talant
                    </th>
                    <th className="px-4 py-3 font-semibold">Turi</th>
                    <th className="px-4 py-3 font-semibold">Holat</th>
                    <th className="px-4 py-3 font-semibold rounded-r-lg">
                      Sana
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                      <td className="px-4 py-3 text-[13px] font-semibold text-ink-1">
                        {r.talent_id ? (
                          <Link
                            href={`/admin/talantlar/${r.talent_id}`}
                            className="hover:text-action-ink"
                          >
                            {talentNames.get(r.talent_id) ?? "—"}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-ink-2">
                        {r.kind === "talant_qiziqishi"
                          ? "Talant arizasi"
                          : "Kompaniya so'rovi"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-ink-2">
                        {r.status}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums">
                        {fmt(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TableCard>
        </div>
      </main>
    </>
  );
}
