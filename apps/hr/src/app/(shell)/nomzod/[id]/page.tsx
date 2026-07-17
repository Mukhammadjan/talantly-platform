import Link from "next/link";
import { notFound } from "next/navigation";
import { talentView } from "@talantly/shared";
import { Header } from "@/components/Header";
import { getDb } from "@/lib/server/db";
import { requireCompany } from "@/lib/server/guard";
import { DIRECTION_LABEL, LEVEL_LABEL, formatSalary } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function NomzodDetailPage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const { company } = await requireCompany();
  const db = getDb();

  const { data } = await db.from("talents").select("*").eq("id", params.id).maybeSingle();
  const row = data as talentView.TalentRow | null;
  if (!row) notFound();

  const { data: setting } = await db
    .from("settings")
    .select("value")
    .eq("key", "show_demo_data")
    .maybeSingle();
  const showDemo =
    ((setting as { value: string } | null)?.value ?? "true").toLowerCase() === "true";
  if (row.is_demo && !showDemo) notFound();

  const { data: test } = await db
    .from("skill_tests")
    .select("score")
    .eq("talent_id", row.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const c = talentView.toCandidateView(row, (test as { score: number } | null)?.score ?? null);

  if (!row.is_demo && row.user_id !== company.user_id) {
    try {
      await db.from("profile_views").insert({ talent_id: row.id, viewer_company_id: company.id });
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <Header title="Nomzod profili" companyName={company.name} />
      <main className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        <div className="max-w-content mx-auto flex flex-col gap-4">
          <Link href="/nomzodlar" className="text-[14px] text-ink-2 hover:text-ink-1 w-fit">
            ← Nomzodlar
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">
            {/* Chap: profil */}
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-white shadow-raise p-6 flex items-center gap-4">
                <span className="w-16 h-16 rounded-full bg-action-soft text-action-ink grid place-items-center font-bold text-2xl">
                  {c.displayName.charAt(0)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[22px] font-bold text-ink-1">{c.displayName}</h2>
                    {c.verified ? (
                      <span className="text-[12px] font-semibold text-verified-ink bg-verified-soft rounded-full px-2 py-0.5">
                        ✓ Tekshirilgan
                      </span>
                    ) : null}
                    {c.isDemo ? (
                      <span className="text-[11px] font-semibold text-ink-3 bg-fill rounded px-1.5 py-0.5">
                        DEMO
                      </span>
                    ) : null}
                  </div>
                  <p className="text-ink-2 text-[15px]">
                    {c.role} · {c.archetype}
                  </p>
                </div>
                <span className="ml-auto text-center">
                  <span className="block text-[28px] font-bold text-verified-ink leading-none">
                    {c.score}
                  </span>
                  <span className="text-[12px] text-ink-3">ball</span>
                </span>
              </div>

              <div className="rounded-lg bg-white shadow-raise p-6 grid grid-cols-3 gap-4 text-center">
                <Stat label="Yo'nalish" value={DIRECTION_LABEL[c.direction] ?? c.direction} />
                <Stat label="Daraja" value={LEVEL_LABEL[c.level] ?? c.level} />
                <Stat label="Tuman" value={c.district || "—"} />
              </div>

              {c.skills.length ? (
                <div className="rounded-lg bg-white shadow-raise p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3 mb-3">
                    Ko&rsquo;nikmalar
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {c.skills.map((s) => (
                      <span key={s} className="text-[13px] text-ink-1 bg-fill rounded-md px-3 py-1.5">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {c.about ? (
                <div className="rounded-lg bg-white shadow-raise p-6">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3 mb-2">
                    Haqida
                  </p>
                  <p className="text-ink-2 text-[15px] leading-relaxed">{c.about}</p>
                </div>
              ) : null}
            </div>

            {/* O'ng: kontakt qulf + CTA */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-6">
              <div className="rounded-lg bg-white shadow-raise p-6 flex flex-col gap-3">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-3">
                  Kutilayotgan maosh
                </p>
                <p className="text-[22px] font-bold text-ink-1">{formatSalary(c.salaryFrom)}</p>
              </div>

              <div className="rounded-lg bg-fill p-6 flex items-start gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-3 shrink-0 mt-0.5">
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
                  <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
                </svg>
                <div>
                  <p className="font-semibold text-ink-1 text-[15px]">CV va telefon raqami</p>
                  <p className="text-ink-3 text-[13px]">So&rsquo;rov yuborilgach ochiladi.</p>
                </div>
              </div>

              <button
                type="button"
                className="h-12 rounded-md bg-action text-white font-semibold text-[15px] hover:brightness-105"
              >
                Nomzodni so&rsquo;rash
              </button>
              <p className="text-[12px] text-ink-3 text-center">
                So&rsquo;rov va to&rsquo;lov oqimi keyingi bosqichda (W3) ulanadi.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <span className="block font-bold text-ink-1 text-[15px]">{value}</span>
      <span className="text-[12px] text-ink-3">{label}</span>
    </div>
  );
}
