import Link from "next/link";
import { interviewSlotsRepo, interviewsRepo } from "@talantly/shared";
import { formatDateTimeUz } from "@/lib/format";
import { getServiceClient } from "@/lib/supabase/service";
import { SlotForm } from "./SlotForm";

export const dynamic = "force-dynamic";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="whitespace-nowrap text-[13px] text-orange">
      {"★".repeat(rating)}
      <span className="text-line">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default async function SuhbatlarPage() {
  const client = getServiceClient();
  const [slots, interviews] = await Promise.all([
    interviewSlotsRepo.listFuture(client),
    interviewsRepo.listWithTalents(client),
  ]);

  const upcoming = interviews.filter((iv) => iv.decision === null);
  const past = interviews.filter((iv) => iv.decision !== null);

  return (
    <div className="mx-auto max-w-[1100px]">
      <h1 className="mb-6 text-[24px] font-bold text-ink">Suhbatlar</h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.8fr]">
        <div className="grid content-start gap-4">
          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">
              Yangi slot
            </h2>
            <SlotForm />
          </section>

          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">
              Kelgusi slotlar
            </h2>
            {slots.length === 0 ? (
              <p className="text-[13px] text-ink-faint">
                Kelgusi slotlar yo'q.
              </p>
            ) : (
              <ul className="grid gap-2">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between rounded-[14px] border border-line px-3 py-2"
                  >
                    <span className="text-[13px] font-semibold text-ink">
                      {formatDateTimeUz(slot.starts_at)}
                    </span>
                    {slot.is_taken ? (
                      <span className="rounded-full bg-orange-tint px-2.5 py-0.5 text-[12px] font-semibold text-orange">
                        Band
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-tint px-2.5 py-0.5 text-[12px] font-semibold text-green-deep">
                        Bo'sh
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid content-start gap-4">
          <section className="card p-5 shadow-soft">
            <h2 className="mb-3 text-[15px] font-bold text-ink">
              Belgilangan suhbatlar
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-[13px] text-ink-faint">
                Qaror kutayotgan suhbatlar yo'q.
              </p>
            ) : (
              <ul className="grid gap-2">
                {upcoming.map((iv) => (
                  <li
                    key={iv.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-line px-3 py-2.5"
                  >
                    <div>
                      {iv.talents ? (
                        <Link
                          href={`/talantlar/${iv.talents.id}`}
                          className="text-[14px] font-semibold text-ink transition-colors hover:text-orange"
                        >
                          {iv.talents.full_name ?? "Nomsiz"}
                        </Link>
                      ) : (
                        <span className="text-[14px] text-ink-faint">
                          Talant o'chirilgan
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] text-ink-soft">
                      {iv.scheduled_at
                        ? formatDateTimeUz(iv.scheduled_at)
                        : "Vaqt yo'q"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card overflow-x-auto shadow-soft">
            <div className="p-5 pb-0">
              <h2 className="text-[15px] font-bold text-ink">
                O'tkazilgan suhbatlar
              </h2>
            </div>
            {past.length === 0 ? (
              <p className="p-5 text-[13px] text-ink-faint">
                Hali suhbatlar o'tkazilmagan.
              </p>
            ) : (
              <table className="mt-3 w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="label-caps px-5 py-2.5">Talant</th>
                    <th className="label-caps px-5 py-2.5">Vaqt</th>
                    <th className="label-caps px-5 py-2.5">Baho</th>
                    <th className="label-caps px-5 py-2.5">Qaror</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((iv) => (
                    <tr
                      key={iv.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-5 py-3">
                        {iv.talents ? (
                          <Link
                            href={`/talantlar/${iv.talents.id}`}
                            className="text-[14px] font-semibold text-ink transition-colors hover:text-orange"
                          >
                            {iv.talents.full_name ?? "Nomsiz"}
                          </Link>
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                        {iv.notes ? (
                          <p className="mt-0.5 max-w-[260px] truncate text-[12px] text-ink-faint">
                            {iv.notes}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[13px] text-ink-soft">
                        {iv.scheduled_at
                          ? formatDateTimeUz(iv.scheduled_at)
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {iv.rating !== null ? (
                          <Stars rating={iv.rating} />
                        ) : (
                          <span className="text-ink-faint">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[13px] font-bold ${
                            iv.decision === "approved"
                              ? "text-green-deep"
                              : "text-red"
                          }`}
                        >
                          {iv.decision === "approved"
                            ? "✓ Tasdiqlangan"
                            : "✗ Rad etilgan"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
