import Link from "next/link";
import { requirePanel } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { formatDateTimeUz } from "@/lib/format";
import { resolveComplaint } from "./actions";

export const dynamic = "force-dynamic";

interface ComplaintRow {
  id: string;
  subject: string | null;
  note: string | null;
  status: string;
  created_at: string;
  user: { phone: string | null; username: string | null } | null;
}

export default async function ShikoyatlarPage({
  searchParams,
}: {
  searchParams: { holat?: string };
}) {
  await requirePanel();
  const db = getServiceClient();
  const showResolved = searchParams.holat === "hal";

  const { data } = await db
    .from("complaints")
    .select("id, subject, note, status, created_at, user:users(phone, username)")
    .order("created_at", { ascending: false })
    .limit(200);
  const all = (data ?? []) as unknown as ComplaintRow[];
  const rows = all.filter((c) =>
    showResolved ? c.status === "hal_qilindi" : c.status !== "hal_qilindi",
  );
  const openCount = all.filter((c) => c.status !== "hal_qilindi").length;

  return (
    <div className="mx-auto max-w-[900px]">
      <header className="mb-5">
        <h1 className="page-title">Shikoyatlar</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Foydalanuvchi murojaatlari va support tiketlar.
        </p>
      </header>

      <div className="mb-4 flex gap-2">
        <Link
          href="/shikoyatlar"
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            !showResolved
              ? "bg-orange-tint text-orange-ink"
              : "bg-surface text-ink-soft hover:bg-surface-2"
          }`}
        >
          Ochiq{openCount > 0 ? ` · ${openCount}` : ""}
        </Link>
        <Link
          href="/shikoyatlar?holat=hal"
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            showResolved
              ? "bg-orange-tint text-orange-ink"
              : "bg-surface text-ink-soft hover:bg-surface-2"
          }`}
        >
          Hal qilingan
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-12 text-center">
          <p className="text-[15px] font-semibold text-ink">
            {showResolved ? "Hal qilingan yo'q" : "Ochiq shikoyat yo'q"}
          </p>
          <p className="text-[13px] text-ink-soft">
            {showResolved ? "" : "Hammasi ko'rib chiqilgan 🎉"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-ink">
                    {c.subject ?? "Mavzusiz murojaat"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">
                    {c.user?.phone ?? c.user?.username ?? "Noma'lum"} ·{" "}
                    {formatDateTimeUz(c.created_at)}
                  </p>
                </div>
                {c.status === "hal_qilindi" ? (
                  <span className="badge badge-green shrink-0">Hal qilindi</span>
                ) : (
                  <form action={resolveComplaint}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="btn-soft shrink-0">
                      Hal qilindi
                    </button>
                  </form>
                )}
              </div>
              {c.note ? (
                <p className="mt-3 whitespace-pre-wrap rounded-input bg-surface-2 p-3 text-[13px] leading-relaxed text-ink-soft">
                  {c.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
