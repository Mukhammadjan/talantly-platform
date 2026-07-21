import Link from "next/link";
import { requirePanel } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { formatDateTimeUz } from "@/lib/format";
import { confirmPayment, rejectPayment } from "./actions";

export const dynamic = "force-dynamic";

interface PaymentRow {
  id: string;
  amount: number;
  status: "kutilmoqda" | "tasdiqlangan" | "rad";
  screenshot_path: string | null;
  created_at: string;
  snapshot_name: string | null;
  talent: { full_name: string | null } | null;
}

const STATUS: Record<
  PaymentRow["status"],
  { label: string; cls: string }
> = {
  kutilmoqda: { label: "Kutilmoqda", cls: "badge-orange" },
  tasdiqlangan: { label: "Tasdiqlangan", cls: "badge-green" },
  rad: { label: "Rad etilgan", cls: "badge-red" },
};

function money(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export default async function TolovlarPage({
  searchParams,
}: {
  searchParams: { holat?: string };
}) {
  await requirePanel();
  const db = getServiceClient();
  const tab = searchParams.holat ?? "kutilmoqda";

  let q = db
    .from("payments")
    .select(
      "id, amount, status, screenshot_path, created_at, snapshot_name, talent:talents(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (tab === "kutilmoqda") q = q.eq("status", "kutilmoqda");
  else if (tab === "hal") q = q.neq("status", "kutilmoqda");
  const { data } = await q;
  const rows = (data ?? []) as unknown as PaymentRow[];

  // Chek skrinshotlariga imzolangan URL (bucket private).
  const signed = new Map<string, string>();
  await Promise.all(
    rows
      .filter((r) => r.screenshot_path)
      .map(async (r) => {
        const { data: s } = await db.storage
          .from("payment-screenshots")
          .createSignedUrl(r.screenshot_path as string, 3600);
        if (s?.signedUrl) signed.set(r.id, s.signedUrl);
      }),
  );

  const tabs = [
    { key: "kutilmoqda", label: "Kutilmoqda" },
    { key: "hal", label: "Ko'rib chiqilgan" },
  ];

  return (
    <div className="mx-auto max-w-[900px]">
      <header className="mb-5">
        <h1 className="page-title">To&apos;lovlar</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Chekni bankda tekshiring, so&apos;ng tasdiqlang yoki rad eting.
        </p>
      </header>

      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/tolovlar?holat=${t.key}`}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              tab === t.key
                ? "bg-orange-tint text-orange-ink"
                : "bg-surface text-ink-soft hover:bg-surface-2"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="card grid place-items-center gap-1 p-12 text-center">
          <p className="text-[15px] font-semibold text-ink">To&apos;lov yo&apos;q</p>
          <p className="text-[13px] text-ink-soft">Hammasi ko&apos;rib chiqilgan 🎉</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] font-bold text-ink">
                    {p.talent?.full_name ?? p.snapshot_name ?? "Noma'lum talant"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">
                    AI CV to&apos;lovi · {formatDateTimeUz(p.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-[20px] font-bold text-ink">
                    {money(p.amount)} <span className="text-[13px]">so&apos;m</span>
                  </p>
                  <span className={`badge ${STATUS[p.status].cls} mt-1`}>
                    {STATUS[p.status].label}
                  </span>
                </div>
              </div>

              {signed.has(p.id) ? (
                <a
                  href={signed.get(p.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block overflow-hidden rounded-input border border-line"
                >
                  <img
                    src={signed.get(p.id)}
                    alt="Chek skrinshoti"
                    className="max-h-64 w-full bg-surface-2 object-contain"
                  />
                </a>
              ) : p.screenshot_path ? (
                <p className="mt-3 text-[12px] text-ink-faint">
                  Chek skrinshoti mavjud, ammo ochib bo&apos;lmadi.
                </p>
              ) : (
                <p className="mt-3 text-[12px] text-ink-faint">
                  Chek skrinshoti yuklanmagan.
                </p>
              )}

              {p.status === "kutilmoqda" ? (
                <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
                  <form action={confirmPayment} className="flex items-center gap-3">
                    <input type="hidden" name="id" value={p.id} />
                    <label className="flex items-center gap-2 text-[13px] text-ink-soft">
                      <input
                        type="checkbox"
                        name="checked"
                        required
                        className="h-4 w-4 accent-orange"
                      />
                      Bankda tekshirdim
                    </label>
                    <button type="submit" className="btn-primary">
                      Tasdiqlash
                    </button>
                  </form>
                  <form action={rejectPayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="btn-danger">
                      Rad etish
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
