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
  skill_tags: string[] | null;
  headline: string | null;
  free_text: string | null;
  portfolio_url: string | null;
  photo_url: string | null;
  archetype: string | null;
  status: string;
  is_demo: boolean;
  is_hidden: boolean;
  created_at: string;
}

interface LogRow {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  created_at: string;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InfoChip({
  value,
  label,
}: {
  value: string;
  label: string;
}): JSX.Element {
  return (
    <div className="rounded-xl border border-line px-4 py-3 min-w-[120px]">
      <p className="text-[15px] font-bold text-ink-1">{value || "—"}</p>
      <p className="text-[12px] text-ink-2 mt-0.5">{label}</p>
    </div>
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
    .select(
      "id, user_id, full_name, birth_year, city, district, direction, level, skill_tags, headline, free_text, portfolio_url, photo_url, archetype, status, is_demo, is_hidden, created_at",
    )
    .eq("id", params.id)
    .maybeSingle();
  const talent = data as TalentRow | null;
  if (!talent) notFound();

  const [{ data: logData }, { data: testData }, userData] = await Promise.all([
    db
      .from("status_log")
      .select("id, old_status, new_status, changed_by, created_at")
      .eq("entity", "talents")
      .eq("entity_id", talent.id)
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("skill_tests")
      .select("score")
      .eq("talent_id", talent.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    talent.user_id
      ? db
          .from("users")
          .select("tg_id, username, is_blocked")
          .eq("id", talent.user_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const logs = (logData ?? []) as LogRow[];
  const test = testData as { score: number } | null;
  const user = userData.data as {
    tg_id: number;
    username: string | null;
    is_blocked: boolean;
  } | null;

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

          {/* Profil header kartasi */}
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

              <div className="flex-1 min-w-[220px]">
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
                  {user
                    ? `${talent.headline ? " · " : ""}${
                        user.username ? "@" + user.username : ""
                      } ${user.tg_id}`
                    : ""}
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
                    value={[talent.city, talent.district]
                      .filter(Boolean)
                      .join(" / ")}
                    label="Manzil"
                  />
                  <InfoChip
                    value={test ? `${test.score} ball` : ""}
                    label="Ko'nikma testi"
                  />
                  <InfoChip value={talent.archetype ?? ""} label="Arxetip" />
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

            {talent.skill_tags?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-5 pt-5 border-t border-line">
                {talent.skill_tags.map((s) => (
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
                {talent.free_text}
              </p>
            ) : null}
          </section>

          {/* Holat tarixi */}
          <TableCard title="Holat tarixi" count={`${logs.length} ta o'zgarish`}>
            {logs.length === 0 ? (
              <p className="py-6 text-center text-[14px] text-ink-2">
                Hali o&apos;zgarish yo&apos;q.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg text-[12px] uppercase tracking-wide text-ink-2">
                      <th className="px-4 py-3 font-semibold rounded-l-lg">№</th>
                      <th className="px-4 py-3 font-semibold">O&apos;tish</th>
                      <th className="px-4 py-3 font-semibold">Kim</th>
                      <th className="px-4 py-3 font-semibold rounded-r-lg">
                        Sana
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={l.id} className={i % 2 === 1 ? "bg-bg/60" : ""}>
                        <td className="px-4 py-3.5 text-[14px] text-ink-2 tabular-nums">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3.5">
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
                        <td className="px-4 py-3.5 text-[13px] text-ink-2">
                          {l.changed_by ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-ink-2 tabular-nums whitespace-nowrap">
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
