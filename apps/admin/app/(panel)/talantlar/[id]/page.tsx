import Link from "next/link";
import { notFound } from "next/navigation";
import {
  cvProfilesRepo,
  interviewsRepo,
  skillTestsRepo,
  statusLogRepo,
  talentsRepo,
} from "@talantly/shared";
import { LevelChip, StatusChip, Tag } from "@/components/chips";
import { ImageUpload } from "@/components/ImageUpload";
import { formatDateTimeUz, formatDateUz } from "@/lib/format";
import {
  ARCHETYPE_LABELS,
  DIRECTION_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  WORK_FORMAT_LABELS,
} from "@/lib/labels";
import { getServiceClient } from "@/lib/supabase/service";
import { ActionsPanel } from "./ActionsPanel";

export const dynamic = "force-dynamic";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-2">
      <span className="label-caps pt-0.5">{label}</span>
      <span className="text-[14px] text-ink">{value}</span>
    </div>
  );
}

export default async function TalantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = getServiceClient();
  const talent = await talentsRepo.findById(client, params.id);
  if (!talent) notFound();

  const [cvProfile, skillTest, interviews, statusLog] = await Promise.all([
    cvProfilesRepo.findByTalentId(client, talent.id),
    skillTestsRepo.findByTalentId(client, talent.id),
    interviewsRepo.listByTalentId(client, talent.id),
    statusLogRepo.listForEntity(client, "talent", talent.id),
  ]);

  let cvPdfUrl: string | null = null;
  if (cvProfile?.pdf_path) {
    const { data } = await client.storage
      .from("cv-pdfs")
      .createSignedUrl(cvProfile.pdf_path, 3600);
    cvPdfUrl = data?.signedUrl ?? null;
  }

  const personality = talent.personality;
  const archetype = personality?.archetype
    ? (ARCHETYPE_LABELS[personality.archetype] ?? personality.archetype)
    : null;

  return (
    <div className="mx-auto max-w-[1100px]">
      <Link
        href="/talantlar"
        className="mb-4 inline-block text-[13px] font-semibold text-ink-soft transition-colors hover:text-orange"
      >
        ← Talantlar
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <ImageUpload
          kind="avatar"
          id={talent.id}
          initialUrl={(talent as { photo_url?: string | null }).photo_url ?? null}
          size={72}
        />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[24px] font-bold text-ink">
            {talent.full_name ?? "Nomsiz"}
          </h1>
          <StatusChip status={talent.status} />
          <LevelChip level={talent.level} />
        </div>
      </div>
      {talent.headline ? (
        <p className="-mt-4 mb-6 text-[14px] text-ink-soft">
          {talent.headline}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid content-start gap-4">
          <section className="card p-5 shadow-soft">
            <h2 className="mb-2 text-[15px] font-bold text-ink">Profil</h2>
            <div className="divide-y divide-line">
              <InfoRow
                label="Yo'nalish"
                value={
                  talent.direction ? DIRECTION_LABELS[talent.direction] : "—"
                }
              />
              <InfoRow label="Shahar" value={talent.city ?? "—"} />
              <InfoRow
                label="Tug'ilgan yil"
                value={talent.birth_year ?? "—"}
              />
              <InfoRow label="Ta'lim" value={talent.education ?? "—"} />
              <InfoRow
                label="Tajriba"
                value={
                  talent.experience_years !== null &&
                  talent.experience_years !== undefined
                    ? `${talent.experience_years} yil`
                    : "—"
                }
              />
              <InfoRow
                label="Ish formati"
                value={
                  (talent.work_formats ?? []).length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                      {(talent.work_formats ?? []).map((f) => (
                        <Tag key={f}>{WORK_FORMAT_LABELS[f]}</Tag>
                      ))}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoRow
                label="Skill teglar"
                value={
                  (talent.skill_tags ?? []).length > 0 ? (
                    <span className="flex flex-wrap gap-1">
                      {(talent.skill_tags ?? []).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoRow
                label="Portfolio"
                value={
                  talent.portfolio_url ? (
                    <a
                      href={talent.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all font-semibold text-orange"
                    >
                      {talent.portfolio_url}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              {talent.free_text ? (
                <InfoRow
                  label="O'zi haqida"
                  value={
                    <span className="whitespace-pre-wrap text-ink-soft">
                      {talent.free_text}
                    </span>
                  }
                />
              ) : null}
            </div>
          </section>

          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">Shaxsiyat</h2>
            {archetype ? (
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-tint px-3 py-1 text-[13px] font-bold text-orange">
                    {archetype}
                  </span>
                  {personality?.tagline ? (
                    <span className="text-[13px] text-ink-soft">
                      {personality.tagline}
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(personality?.strengths ?? []).length > 0 ? (
                    <div>
                      <p className="label-caps mb-1.5">Kuchli tomonlar</p>
                      <ul className="grid gap-1">
                        {(personality?.strengths ?? []).map((s) => (
                          <li key={s} className="text-[13px] text-ink">
                            <span className="mr-1.5 text-green-deep">+</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {(personality?.weaknesses ?? []).length > 0 ? (
                    <div>
                      <p className="label-caps mb-1.5">Rivojlantirish kerak</p>
                      <ul className="grid gap-1">
                        {(personality?.weaknesses ?? []).map((w) => (
                          <li key={w} className="text-[13px] text-ink">
                            <span className="mr-1.5 text-orange">•</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-ink-faint">
                Arxetip testi hali topshirilmagan.
              </p>
            )}
          </section>

          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">
              Suhbatlar tarixi
            </h2>
            {interviews.length === 0 ? (
              <p className="text-[13px] text-ink-faint">
                Suhbatlar hali o'tkazilmagan.
              </p>
            ) : (
              <ul className="grid gap-3">
                {interviews.map((iv) => (
                  <li
                    key={iv.id}
                    className="rounded-[14px] border border-line p-3"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[13px] font-semibold text-ink">
                        {iv.scheduled_at
                          ? formatDateTimeUz(iv.scheduled_at)
                          : "Vaqt belgilanmagan"}
                      </p>
                      {iv.decision ? (
                        <span
                          className={`text-[12px] font-bold ${
                            iv.decision === "approved"
                              ? "text-green-deep"
                              : "text-red"
                          }`}
                        >
                          {iv.decision === "approved"
                            ? "✓ Tasdiqlangan"
                            : "✗ Rad etilgan"}
                        </span>
                      ) : (
                        <span className="text-[12px] text-ink-faint">
                          Qaror kutilmoqda
                        </span>
                      )}
                    </div>
                    {iv.rating !== null ? (
                      <p className="mt-1 text-[13px] text-ink-soft">
                        Baho: {"★".repeat(iv.rating)}
                        {"☆".repeat(5 - iv.rating)} ({iv.rating}/5)
                      </p>
                    ) : null}
                    {iv.notes ? (
                      <p className="mt-1 text-[13px] text-ink-soft">
                        {iv.notes}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">
              Status tarixi
            </h2>
            {statusLog.length === 0 ? (
              <p className="text-[13px] text-ink-faint">
                Hali yozuvlar yo'q.
              </p>
            ) : (
              <ol className="relative ml-2 grid gap-4 border-l border-line pl-5">
                {statusLog.map((log) => (
                  <li key={log.id} className="relative">
                    <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-orange" />
                    <p className="text-[13px] font-semibold text-ink">
                      {log.new_status
                        ? (STATUS_LABELS[
                            log.new_status as keyof typeof STATUS_LABELS
                          ] ?? log.new_status)
                        : "—"}
                    </p>
                    <p className="text-[12px] text-ink-faint">
                      {formatDateTimeUz(log.created_at)}
                      {log.old_status
                        ? ` · oldingi: ${
                            STATUS_LABELS[
                              log.old_status as keyof typeof STATUS_LABELS
                            ] ?? log.old_status
                          }`
                        : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="grid content-start gap-4">
          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">Amallar</h2>
            <ActionsPanel
              talentId={talent.id}
              status={talent.status}
              hasTest={skillTest !== null}
              statusOptions={STATUS_ORDER.map((s) => ({
                value: s,
                label: STATUS_LABELS[s],
              }))}
            />
          </section>

          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">
              Test va CV
            </h2>
            <div className="grid gap-3">
              <div className="flex items-baseline justify-between">
                <span className="label-caps">Test bali</span>
                <span className="text-[20px] font-bold text-ink">
                  {skillTest?.score ?? "—"}
                  {skillTest?.score !== null && skillTest?.score !== undefined
                    ? "/100"
                    : ""}
                </span>
              </div>
              {skillTest?.passed_at ? (
                <p className="-mt-2 text-right text-[12px] text-ink-faint">
                  {formatDateUz(skillTest.passed_at)}
                </p>
              ) : null}
              {cvProfile?.ai_verdict ? (
                <div>
                  <p className="label-caps mb-1">AI xulosasi</p>
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    {cvProfile.ai_verdict}
                  </p>
                </div>
              ) : null}
              {cvPdfUrl ? (
                <a
                  href={cvPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary text-center"
                >
                  CV PDF ochish
                </a>
              ) : (
                <p className="text-[13px] text-ink-faint">
                  CV PDF hali tayyor emas.
                </p>
              )}
            </div>
          </section>

          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">Meta</h2>
            <div className="grid gap-1.5 text-[13px] text-ink-soft">
              <p>Ro'yxatdan o'tgan: {formatDateUz(talent.created_at)}</p>
              {talent.verified_at ? (
                <p>Tekshirilgan: {formatDateUz(talent.verified_at)}</p>
              ) : null}
              <p className="break-all text-[12px] text-ink-faint">
                ID: {talent.id}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
