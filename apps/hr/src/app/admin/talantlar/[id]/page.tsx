import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { TalentAdminActions } from "@/components/TalentAdminActions";
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

function Field({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide font-semibold text-ink-2">
        {label}
      </p>
      <p className="mt-0.5 text-[14px] text-ink-1">{value || "—"}</p>
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
      "id, user_id, full_name, birth_year, city, district, direction, level, skill_tags, headline, free_text, portfolio_url, archetype, status, is_demo, is_hidden, created_at",
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
      .select("score, created_at")
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
      <Header title={talent.full_name ?? "Talant"} companyName="Admin" />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-shell mx-auto flex flex-col gap-5">
          <Link
            href="/admin/talantlar"
            className="text-[13px] font-semibold text-ink-2 hover:text-ink-1"
          >
            ← Talantlar ro&apos;yxati
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
            <section className="bg-white rounded-xl border border-line p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[20px] font-bold text-ink-1">
                    {talent.full_name ?? "—"}
                    {talent.is_demo ? (
                      <span className="ml-2 align-middle text-[11px] font-bold uppercase bg-fill text-ink-2 rounded px-1.5 py-0.5">
                        Demo
                      </span>
                    ) : null}
                  </h2>
                  <p className="text-[14px] text-ink-2">
                    {talent.headline ?? ""}
                  </p>
                </div>
                <span className="shrink-0 inline-block rounded-full px-3 py-1 text-[13px] font-bold bg-fill text-ink-1">
                  {talent.status}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Yo'nalish" value={talent.direction ?? ""} />
                <Field label="Daraja" value={talent.level ?? ""} />
                <Field
                  label="Shahar / tuman"
                  value={[talent.city, talent.district].filter(Boolean).join(" / ")}
                />
                <Field
                  label="Tug'ilgan yil"
                  value={talent.birth_year ? String(talent.birth_year) : ""}
                />
                <Field label="Arxetip" value={talent.archetype ?? ""} />
                <Field
                  label="Test ball"
                  value={test ? String(test.score) : ""}
                />
                <Field
                  label="Telegram"
                  value={
                    user
                      ? `${user.username ? "@" + user.username + " · " : ""}${user.tg_id}`
                      : ""
                  }
                />
                <Field
                  label="Portfolio"
                  value={talent.portfolio_url ?? ""}
                />
                <Field label="Qo'shilgan" value={fmt(talent.created_at)} />
              </div>

              {talent.skill_tags?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {talent.skill_tags.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-fill px-2.5 py-1 text-[12px] font-medium text-ink-1"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}

              {talent.free_text ? (
                <p className="text-[14px] leading-6 text-ink-2 border-t border-line pt-4">
                  {talent.free_text}
                </p>
              ) : null}

              <div className="border-t border-line pt-4">
                <TalentAdminActions
                  talentId={talent.id}
                  isHidden={talent.is_hidden}
                  isBlocked={user?.is_blocked ?? false}
                  hasUser={Boolean(user)}
                />
                {user?.is_blocked ? (
                  <p className="mt-2 text-[13px] font-semibold text-danger-ink">
                    ⛔ Bu foydalanuvchi bloklangan — ilovaga kira olmaydi.
                  </p>
                ) : null}
                {talent.is_hidden ? (
                  <p className="mt-2 text-[13px] font-semibold text-ink-2">
                    🙈 Profil feed&apos;dan yashirilgan.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-line p-6">
              <h3 className="text-[15px] font-bold text-ink-1 mb-4">
                Holat tarixi
              </h3>
              {logs.length === 0 ? (
                <p className="text-[14px] text-ink-2">Hali o&apos;zgarish yo&apos;q.</p>
              ) : (
                <ol className="flex flex-col gap-0">
                  {logs.map((l, i) => (
                    <li key={l.id} className="relative pl-6 pb-4 last:pb-0">
                      <span
                        className={`absolute left-0 top-1 w-3 h-3 rounded-full ${
                          i === 0 ? "bg-action" : "bg-line-strong"
                        }`}
                      />
                      {i !== logs.length - 1 ? (
                        <span className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-line" />
                      ) : null}
                      <p className="text-[13px] font-semibold text-ink-1">
                        {l.old_status ? `${l.old_status} → ` : ""}
                        {l.new_status}
                      </p>
                      <p className="text-[12px] text-ink-2">
                        {fmt(l.created_at)}
                        {l.changed_by ? ` · ${l.changed_by}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
