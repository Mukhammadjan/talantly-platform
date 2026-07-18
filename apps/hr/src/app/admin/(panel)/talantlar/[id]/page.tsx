import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { TalentAdminActions } from "@/components/TalentAdminActions";
import {
  DIRECTION_LABELS,
  STATUS_LABELS,
  StatusPill,
  TableCard,
} from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/server/admin";
import { getDb } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface TalentRow {
  id: string;
  user_id: string | null;
  full_name: string | null;
  birth_year: number | null;
  city: string | null;
  district: string | null;
  direction: string | null;
  level: string | null;
  experience_years: number | null;
  skill_tags: string[] | null;
  work_formats: string[] | null;
  salary_from: number | null;
  salary_currency: string | null;
  headline: string | null;
  free_text: string | null;
  portfolio_url: string | null;
  photo_url: string | null;
  personality: { answers?: number[] } | null;
  archetype: string | null;
  status: string;
  is_demo: boolean;
  is_hidden: boolean;
  verified_at: string | null;
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

function fmtD(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uz-UZ");
}

function money(n: number | null): string {
  return n == null ? "—" : `${n.toLocaleString("ru-RU")} UZS`;
}

function InfoChip({ value, label }: { value: string; label: string }): JSX.Element {
  return (
    <div className="rounded-xl border border-line px-4 py-3 min-w-[110px]">
      <p className="text-[15px] font-bold text-ink-1">{value || "—"}</p>
      <p className="text-[12px] text-ink-2 mt-0.5">{label}</p>
    </div>
  );
}

function Th({ children, r }: { children?: React.ReactNode; r?: boolean }): JSX.Element {
  return (
    <th
      className={`px-4 py-3 font-semibold ${r ? "rounded-r-lg" : ""} first:rounded-l-lg`}
    >
      {children}
    </th>
  );
}

export default async function AdminTalentDetailPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  await requireAdminPage();
  const db = getDb();

  const { data } = await db
    .from("talents")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  const talent = data as TalentRow | null;
  if (!talent) notFound();

  const [
    userRes,
    logsRes,
    testsRes,
    interviewsRes,
    paymentsRes,
    requestsRes,
    unlocksRes,
    cvRes,
    viewsRes,
  ] = await Promise.all([
    talent.user_id
      ? db
          .from("users")
          .select("tg_id, username, preferred_mode, is_blocked, is_blocked_bot, created_at")
          .eq("id", talent.user_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    db
      .from("status_log")
      .select("id, old_status, new_status, changed_by, created_at")
      .eq("entity", "talents")
      .eq("entity_id", talent.id)
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("skill_tests")
      .select("id, direction, score, attempt_no, created_at")
      .eq("talent_id", talent.id)
      .order("created_at", { ascending: false }),
    db
      .from("interviews")
      .select("id, scheduled_at, rating, decision, decision_reason, notes, decided_at")
      .eq("talent_id", talent.id)
      .order("scheduled_at", { ascending: false }),
    db
      .from("payments")
      .select("id, amount, screenshot_path, status, created_at")
      .eq("talent_id", talent.id)
      .order("created_at", { ascending: false }),
    db
      .from("requests")
      .select("id, kind, company_id, vacancy_id, status, created_at")
      .eq("talent_id", talent.id)
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("contact_unlocks")
      .select("id, company_id, kind, amount, status, created_at")
      .eq("talent_id", talent.id)
      .order("created_at", { ascending: false })
      .limit(30),
    db.from("cv_profiles").select("*").eq("talent_id", talent.id).maybeSingle(),
    db
      .from("profile_views")
      .select("id", { count: "exact", head: true })
      .eq("talent_id", talent.id),
  ]);

  const user = userRes.data as {
    tg_id: number;
    username: string | null;
    preferred_mode: string | null;
    is_blocked: boolean;
    is_blocked_bot: boolean;
    created_at: string;
  } | null;
  const logs = (logsRes.data ?? []) as {
    id: string;
    old_status: string | null;
    new_status: string;
    changed_by: string | null;
    created_at: string;
  }[];
  const tests = (testsRes.data ?? []) as {
    id: string;
    direction: string | null;
    score: number;
    attempt_no: number | null;
    created_at: string;
  }[];
  const interviews = (interviewsRes.data ?? []) as {
    id: string;
    scheduled_at: string;
    rating: number | null;
    decision: string | null;
    decision_reason: string | null;
    notes: string | null;
    decided_at: string | null;
  }[];
  const payments = (paymentsRes.data ?? []) as {
    id: string;
    amount: number;
    screenshot_path: string | null;
    status: string;
    created_at: string;
  }[];
  const requests = (requestsRes.data ?? []) as {
    id: string;
    kind: string;
    company_id: string | null;
    vacancy_id: string | null;
    status: string;
    created_at: string;
  }[];
  const unlocks = (unlocksRes.data ?? []) as {
    id: string;
    company_id: string | null;
    kind: string;
    amount: number;
    status: string;
    created_at: string;
  }[];
  const cv = cvRes.data as {
    summary: string | null;
    skills: string[] | null;
    experience: { title?: string; org?: string; desc?: string }[] | null;
    ai_verdict: string | null;
    pdf_path: string | null;
    generated_at: string | null;
  } | null;
  const views = viewsRes.count ?? 0;

  // Kompaniya nomlari (requests + unlocks uchun)
  const compIds = [
    ...new Set(
      [...requests, ...unlocks].map((r) => r.company_id).filter(Boolean),
    ),
  ] as string[];
  const compNames = new Map<string, string>();
  if (compIds.length) {
    const { data: comps } = await db
      .from("companies")
      .select("id, name")
      .in("id", compIds);
    for (const c of (comps ?? []) as { id: string; name: string | null }[]) {
      compNames.set(c.id, c.name ?? "—");
    }
  }
  // Vakansiya nomlari
  const vacIds = [
    ...new Set(requests.map((r) => r.vacancy_id).filter(Boolean)),
  ] as string[];
  const vacNames = new Map<string, string>();
  if (vacIds.length) {
    const { data: vacs } = await db
      .from("vacancies")
      .select("id, title")
      .in("id", vacIds);
    for (const v of (vacs ?? []) as { id: string; title: string | null }[]) {
      vacNames.set(v.id, v.title ?? "—");
    }
  }

  // Chek va CV PDF signed URL'lar
  const payItems = await Promise.all(
    payments.map(async (p) => {
      let url: string | null = null;
      if (p.screenshot_path) {
        const { data: s } = await db.storage
          .from("payment-screenshots")
          .createSignedUrl(p.screenshot_path, 3600);
        url = s?.signedUrl ?? null;
      }
      return { ...p, url };
    }),
  );
  let cvPdfUrl: string | null = null;
  if (cv?.pdf_path) {
    const { data: s } = await db.storage
      .from("cv-pdfs")
      .createSignedUrl(cv.pdf_path, 3600);
    cvPdfUrl = s?.signedUrl ?? null;
  }

  const pill = (status: string, okVals: string[], badVals: string[]): string =>
    okVals.includes(status)
      ? "bg-verified-soft text-verified-ink"
      : badVals.includes(status)
        ? "bg-danger-soft text-danger-ink"
        : "bg-fill text-ink-2";

  return (
    <>
      <AdminHeader title={talent.full_name ?? "Talant"} crumb="Talantlar" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-bg">
        <div className="max-w-shell mx-auto flex flex-col gap-5">
          <Link
            href="/admin/talantlar"
            className="text-[13px] font-semibold text-ink-2 hover:text-ink-1 w-fit"
          >
            ← Talantlar ro&apos;yxati
          </Link>

          {/* ==== Profil hero ==== */}
          <section className="bg-white rounded-2xl border border-line p-6">
            <div className="flex items-start gap-5 flex-wrap">
              {talent.photo_url ? (
                <img
                  src={talent.photo_url}
                  alt={talent.full_name ?? ""}
                  className="w-[120px] h-[120px] rounded-2xl object-cover bg-fill"
                />
              ) : (
                <span className="w-[120px] h-[120px] rounded-2xl bg-action-soft text-action-ink grid place-items-center text-[42px] font-bold">
                  {(talent.full_name ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[24px] font-bold text-ink-1">
                    {talent.full_name ?? "—"}
                  </h2>
                  <StatusPill status={talent.status} />
                  {talent.is_demo ? (
                    <span className="rounded-full bg-fill text-ink-2 px-2.5 py-0.5 text-[11px] font-bold uppercase">
                      Demo
                    </span>
                  ) : null}
                </div>
                <p className="text-[15px] text-ink-2 mt-1">
                  {talent.headline ?? ""}
                </p>
                <div className="flex gap-3 flex-wrap mt-4">
                  <InfoChip
                    value={talent.birth_year ? String(talent.birth_year) : ""}
                    label="Tug'ilgan yil"
                  />
                  <InfoChip
                    value={
                      DIRECTION_LABELS[talent.direction ?? ""] ??
                      talent.direction ??
                      ""
                    }
                    label="Yo'nalish"
                  />
                  <InfoChip value={talent.level ?? ""} label="Daraja" />
                  <InfoChip
                    value={
                      talent.experience_years != null
                        ? `${talent.experience_years} yil`
                        : ""
                    }
                    label="Tajriba"
                  />
                  <InfoChip
                    value={[talent.city, talent.district]
                      .filter(Boolean)
                      .join(" / ")}
                    label="Manzil"
                  />
                  <InfoChip
                    value={
                      talent.salary_from
                        ? `${talent.salary_from.toLocaleString("ru-RU")} ${talent.salary_currency ?? "UZS"}`
                        : ""
                    }
                    label="Kutilayotgan maosh"
                  />
                  <InfoChip
                    value={(talent.work_formats ?? []).join(", ")}
                    label="Ish formati"
                  />
                  <InfoChip value={talent.archetype ?? ""} label="Arxetip" />
                  <InfoChip value={String(views)} label="Profil ko'rishlar" />
                </div>
              </div>
              <div className="shrink-0">
                <TalentAdminActions
                  talentId={talent.id}
                  isHidden={talent.is_hidden}
                  isBlocked={user?.is_blocked ?? false}
                  hasUser={Boolean(user)}
                />
                {user?.is_blocked ? (
                  <p className="mt-2 text-[13px] font-semibold text-danger-ink text-right">
                    ⛔ Bloklangan
                  </p>
                ) : null}
                {talent.is_hidden ? (
                  <p className="mt-2 text-[13px] font-semibold text-ink-2 text-right">
                    🙈 Feed&apos;dan yashirilgan
                  </p>
                ) : null}
              </div>
            </div>

            {(talent.skill_tags ?? []).length || talent.portfolio_url ? (
              <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-line">
                {(talent.skill_tags ?? []).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-fill px-3 py-1.5 text-[13px] font-medium text-ink-1"
                  >
                    {s}
                  </span>
                ))}
                {talent.portfolio_url ? (
                  <a
                    href={talent.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-action-soft text-action-ink px-3 py-1.5 text-[13px] font-semibold hover:underline"
                  >
                    Portfolio ↗
                  </a>
                ) : null}
              </div>
            ) : null}
            {talent.free_text ? (
              <p className="text-[14px] leading-6 text-ink-2 mt-4">
                &ldquo;{talent.free_text}&rdquo;
              </p>
            ) : null}
          </section>

          {/* ==== Telegram / hisob ==== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <TableCard title="Telegram hisobi">
              {user ? (
                <div className="grid grid-cols-2 gap-3">
                  <InfoChip value={String(user.tg_id)} label="Telegram ID" />
                  <InfoChip
                    value={user.username ? `@${user.username}` : ""}
                    label="Username"
                  />
                  <InfoChip
                    value={fmtD(user.created_at)}
                    label="Ro'yxatdan o'tgan"
                  />
                  <InfoChip
                    value={
                      user.is_blocked
                        ? "⛔ Bloklangan"
                        : user.is_blocked_bot
                          ? "Bot bloklangan"
                          : "Faol"
                    }
                    label="Hisob holati"
                  />
                  {user.username ? (
                    <a
                      href={`https://t.me/${user.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 h-11 rounded-lg bg-fill text-ink-1 text-[14px] font-bold grid place-items-center hover:bg-line transition-colors"
                    >
                      Telegram&apos;da ochish ↗
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className="text-[14px] text-ink-2">
                  Foydalanuvchi bog&apos;lanmagan (demo profil).
                </p>
              )}
            </TableCard>

            {/* ==== AI CV ==== */}
            <TableCard
              title="AI CV"
              right={
                cvPdfUrl ? (
                  <a
                    href={cvPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-4 rounded-lg bg-action text-white text-[13px] font-bold grid place-items-center hover:bg-action/90"
                  >
                    PDF yuklab olish
                  </a>
                ) : undefined
              }
            >
              {cv ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[14px] leading-6 text-ink-1">
                    {cv.summary ?? "—"}
                  </p>
                  {(cv.skills ?? []).length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {(cv.skills ?? []).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-fill px-2.5 py-1 text-[12px] font-medium text-ink-1"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {cv.ai_verdict ? (
                    <p className="text-[13px] leading-5 text-ink-2 border-t border-line pt-3">
                      <strong className="text-ink-1">AI xulosasi:</strong>{" "}
                      {cv.ai_verdict}
                    </p>
                  ) : null}
                  <p className="text-[12px] text-ink-3">
                    Yaratilgan: {fmt(cv.generated_at)}
                    {cv.pdf_path ? " · PDF tayyor" : " · PDF navbatda (bot)"}
                  </p>
                </div>
              ) : (
                <p className="text-[14px] text-ink-2">
                  CV hali yaratilmagan (to&apos;lov bosqichidan keyin).
                </p>
              )}
            </TableCard>
          </div>

          {/* ==== Testlar + Suhbatlar ==== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <TableCard
              title="Ko'nikma test urinishlari"
              count={`${tests.length} ta`}
            >
              {tests.length === 0 ? (
                <p className="py-4 text-[14px] text-ink-2">Hali test yo&apos;q.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <Th>№</Th>
                      <Th>Ball</Th>
                      <Th>Urinish</Th>
                      <Th r>Sana</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((t, i) => (
                      <tr key={t.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[14px] text-ink-2">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[13px] font-bold ${
                              t.score >= 60
                                ? "bg-verified-soft text-verified-ink"
                                : "bg-danger-soft text-danger-ink"
                            }`}
                          >
                            {t.score} ball
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[14px] text-ink-2">
                          {t.attempt_no ?? 1}-urinish
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums">
                          {fmt(t.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableCard>

            <TableCard title="Suhbatlar" count={`${interviews.length} ta`}>
              {interviews.length === 0 ? (
                <p className="py-4 text-[14px] text-ink-2">
                  Hali suhbat yo&apos;q.
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <Th>Vaqt</Th>
                      <Th>Baho</Th>
                      <Th>Qaror</Th>
                      <Th r>Izoh</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map((iv, i) => (
                      <tr key={iv.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums whitespace-nowrap">
                          {fmt(iv.scheduled_at)}
                        </td>
                        <td className="px-4 py-3 text-[14px] font-bold text-ink-1">
                          {iv.rating ? `${iv.rating}/5` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${pill(
                              iv.decision ?? "",
                              ["approved"],
                              ["rejected", "kelmadi"],
                            )}`}
                          >
                            {iv.decision === "approved"
                              ? "Tasdiqlangan"
                              : iv.decision === "rejected"
                                ? `Rad${iv.decision_reason ? ` (${iv.decision_reason})` : ""}`
                                : iv.decision === "kelmadi"
                                  ? "Kelmadi"
                                  : "Kutilmoqda"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {iv.notes ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableCard>
          </div>

          {/* ==== To'lovlar ==== */}
          <TableCard title="To'lovlar" count={`${payItems.length} ta`}>
            {payItems.length === 0 ? (
              <p className="py-4 text-[14px] text-ink-2">
                Hali to&apos;lov yo&apos;q.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <Th>№</Th>
                      <Th>Summa</Th>
                      <Th>Holat</Th>
                      <Th>Chek</Th>
                      <Th r>Sana</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {payItems.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[14px] text-ink-2">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 text-[14px] font-bold text-ink-1 tabular-nums">
                          {money(p.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${pill(
                              p.status,
                              ["tasdiqlangan"],
                              ["rad"],
                            )}`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.url ? (
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[13px] font-semibold text-verified-ink hover:underline"
                            >
                              Chekni ochish ↗
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums">
                          {fmt(p.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TableCard>

          {/* ==== Arizalar + Kontakt ochishlar ==== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <TableCard
              title="Arizalar / so'rovlar"
              count={`${requests.length} ta`}
            >
              {requests.length === 0 ? (
                <p className="py-4 text-[14px] text-ink-2">
                  Hali so&apos;rov yo&apos;q.
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <Th>Turi</Th>
                      <Th>Kompaniya / vakansiya</Th>
                      <Th>Holat</Th>
                      <Th r>Sana</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[13px] font-semibold text-ink-1">
                          {r.kind === "talant_qiziqishi"
                            ? "Talant arizasi"
                            : "Kompaniya so'rovi"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {r.company_id
                            ? compNames.get(r.company_id) ?? "—"
                            : "—"}
                          {r.vacancy_id
                            ? ` · ${vacNames.get(r.vacancy_id) ?? ""}`
                            : ""}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {r.status}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums">
                          {fmtD(r.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </TableCard>

            <TableCard
              title="Kontakt ochishlar"
              count={`${unlocks.length} ta`}
            >
              {unlocks.length === 0 ? (
                <p className="py-4 text-[14px] text-ink-2">
                  Kontakt hali ochilmagan.
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <Th>Kompaniya</Th>
                      <Th>Turi</Th>
                      <Th>Summa</Th>
                      <Th r>Holat</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {unlocks.map((u, i) => (
                      <tr key={u.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[13px] font-semibold text-ink-1">
                          {u.company_id
                            ? compNames.get(u.company_id) ?? "—"
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {u.kind}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-bold text-ink-1 tabular-nums">
                          {money(u.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[12px] font-bold ${pill(
                              u.status,
                              ["tasdiqlangan"],
                              ["rad"],
                            )}`}
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

          {/* ==== Holat tarixi ==== */}
          <TableCard title="Holat tarixi" count={`${logs.length} ta o'zgarish`}>
            {logs.length === 0 ? (
              <p className="py-4 text-[14px] text-ink-2">
                Hali o&apos;zgarish yo&apos;q.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <Th>№</Th>
                      <Th>O&apos;tish</Th>
                      <Th>Kim</Th>
                      <Th r>Sana</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={l.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3 text-[14px] text-ink-2 tabular-nums">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-2 text-[14px]">
                            <span className="text-ink-2">
                              {l.old_status
                                ? STATUS_LABELS[l.old_status] ?? l.old_status
                                : "—"}
                            </span>
                            <span className="text-ink-3">→</span>
                            <span className="font-semibold text-ink-1">
                              {STATUS_LABELS[l.new_status] ?? l.new_status}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2">
                          {l.changed_by ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-ink-2 tabular-nums whitespace-nowrap">
                          {fmt(l.created_at)}
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
