import { companiesRepo, skillTestsRepo, talentsRepo } from "@talantly/shared";
import { Logo } from "@/components/Logo";
import { Tag } from "@/components/chips";
import { formatDateUz } from "@/lib/format";
import {
  ARCHETYPE_LABELS,
  DIRECTION_LABELS,
  LEVEL_LABELS,
  WORK_FORMAT_LABELS,
} from "@/lib/labels";
import { verifyShareToken } from "@/lib/shareToken";
import { getServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

function SealBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-tint px-2.5 py-1 text-[12px] font-semibold text-green-deep">
      <svg width="14" height="14" viewBox="0 0 12 12" aria-hidden>
        <circle cx="6" cy="6" r="6" fill="var(--green)" />
        <path
          d="M3.4 6.2 5.2 8l3.4-3.8"
          fill="none"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Tekshirilgan
    </span>
  );
}

function ExpiredPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo />
      <h1 className="text-[20px] font-bold text-ink">
        Havola muddati tugagan
      </h1>
      <p className="text-[14px] text-ink-soft">
        Bu havola eskirgan yoki noto'g'ri. Yangi havola olish uchun talantly
        jamoasi bilan bog'laning.
      </p>
      <p className="text-[14px] font-semibold text-orange">
        +998 99-030-73-22
      </p>
    </main>
  );
}

export default async function UlashishPage({
  params,
}: {
  params: { token: string };
}) {
  const payload = verifyShareToken(params.token);
  if (!payload) return <ExpiredPage />;

  const client = getServiceClient();
  const [company, talentsRaw, tests] = await Promise.all([
    companiesRepo.findById(client, payload.companyId),
    Promise.all(
      payload.talentIds.map((id) => talentsRepo.findById(client, id)),
    ),
    skillTestsRepo.listAll(client),
  ]);

  // Re-check verification at view time — a revoked seal drops the talent
  const talents = talentsRaw.filter(
    (t): t is NonNullable<typeof t> =>
      t !== null && t.status === "tekshirilgan",
  );
  if (!company || talents.length === 0) return <ExpiredPage />;

  const scores = new Map<string, number>();
  for (const test of tests) {
    if (test.talent_id && test.score !== null && !scores.has(test.talent_id)) {
      scores.set(test.talent_id, test.score);
    }
  }

  return (
    <main className="mx-auto max-w-[760px] p-5 pb-16 md:p-10">
      <header className="mb-8 grid gap-4">
        <Logo />
        <div>
          <p className="label-caps mb-1">Maxsus tanlov</p>
          <h1 className="text-[24px] font-bold leading-tight text-ink">
            {company.name} uchun tekshirilgan nomzodlar
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-soft">
            Har bir nomzod talantly'ning 3 bosqichli tekshiruvidan o'tgan:
            bilim testi, shaxsiyat tahlili va jonli suhbat.
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {talents.map((t) => {
          const score = scores.get(t.id);
          const archetype = t.personality?.archetype
            ? (ARCHETYPE_LABELS[t.personality.archetype] ??
              t.personality.archetype)
            : null;
          return (
            <article key={t.id} className="card p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[18px] font-bold text-ink">
                  {t.full_name ?? "Nomsiz"}
                </h2>
                <SealBadge />
              </div>
              {t.headline ? (
                <p className="mt-1 text-[14px] text-ink-soft">{t.headline}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.direction ? (
                  <Tag>{DIRECTION_LABELS[t.direction]}</Tag>
                ) : null}
                {t.level ? <Tag>{LEVEL_LABELS[t.level]}</Tag> : null}
                {t.city ? <Tag>{t.city}</Tag> : null}
                {archetype ? <Tag>{archetype}</Tag> : null}
                {(t.work_formats ?? []).map((f) => (
                  <Tag key={f}>{WORK_FORMAT_LABELS[f]}</Tag>
                ))}
              </div>

              {(t.skill_tags ?? []).length > 0 ? (
                <div className="mt-3">
                  <p className="label-caps mb-1.5">Ko'nikmalar</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(t.skill_tags ?? []).map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3">
                {score !== undefined ? (
                  <p className="text-[13px] text-ink-soft">
                    Bilim testi:{" "}
                    <span className="font-bold text-ink">{score}/100</span>
                  </p>
                ) : null}
                {t.verified_at ? (
                  <p className="text-[13px] text-ink-soft">
                    Tekshirilgan: {formatDateUz(t.verified_at)}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <footer className="mt-10 rounded-card border border-line bg-surface p-5 text-center shadow-soft">
        <p className="text-[14px] font-semibold text-ink">
          Nomzod bilan bog'lanishni xohlaysizmi?
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          talantly jamoasiga murojaat qiling — biz sizni to'g'ridan-to'g'ri
          bog'laymiz.
        </p>
        <p className="mt-2 text-[16px] font-bold text-orange">
          +998 99-030-73-22
        </p>
        <p className="mt-3 text-[12px] text-ink-faint">
          Havola amal qilish muddati: {formatDateUz(new Date(payload.exp).toISOString())}
        </p>
      </footer>
    </main>
  );
}
