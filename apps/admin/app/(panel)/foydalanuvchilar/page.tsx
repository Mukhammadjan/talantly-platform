import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { formatDateUz } from "@/lib/format";
import { RowActions } from "./RowActions";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  phone: string | null;
  username: string | null;
  account_status: "active" | "frozen";
  freeze_reason: string | null;
  created_at: string;
  talent: { full_name: string | null } | null;
}

export default async function FoydalanuvchilarPage({
  searchParams,
}: {
  searchParams: { holat?: string };
}) {
  const { user: me } = await requireRole("admin");
  const db = getServiceClient();
  const frozen = searchParams.holat === "muzlatilgan";

  const { data } = await db
    .from("users")
    .select(
      "id, phone, username, account_status, freeze_reason, created_at, talent:talents(full_name)",
    )
    .eq("role", "talent")
    .eq("account_status", frozen ? "frozen" : "active")
    .order("created_at", { ascending: false })
    .limit(500);
  const rows = (data ?? []) as unknown as Row[];

  // Hard-delete tasdiqi bilan mos: server full_name ?? phone kutadi.
  const nameOf = (r: Row): string =>
    r.talent?.full_name ?? r.phone ?? r.username ?? "Noma'lum";

  return (
    <div className="mx-auto max-w-[1000px]">
      <header className="mb-5">
        <h1 className="page-title">Foydalanuvchilar</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Talantlar — muzlatish, tiklash yoki butunlay o&apos;chirish.
        </p>
      </header>

      <div className="mb-4 flex gap-2">
        <Link
          href="/foydalanuvchilar"
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            !frozen ? "bg-orange-tint text-orange-ink" : "bg-surface text-ink-soft hover:bg-surface-2"
          }`}
        >
          Faol
        </Link>
        <Link
          href="/foydalanuvchilar?holat=muzlatilgan"
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            frozen ? "bg-orange-tint text-orange-ink" : "bg-surface text-ink-soft hover:bg-surface-2"
          }`}
        >
          Muzlatilganlar
        </Link>
      </div>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-[14px] text-ink-soft">
            {frozen ? "Muzlatilgan foydalanuvchi yo'q." : "Foydalanuvchi yo'q."}
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="t-head">
                <th className="px-5 py-3">Ism</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">Qo&apos;shilgan</th>
                <th className="px-5 py-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="t-row">
                  <td className="px-5 py-3">
                    <span className="text-[14px] font-semibold text-ink">
                      {nameOf(r)}
                    </span>
                    {frozen && r.freeze_reason ? (
                      <span className="mt-0.5 block text-[12px] text-ink-faint">
                        {r.freeze_reason}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 num text-[13px] text-ink-soft">
                    {r.phone ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-ink-faint">
                    {formatDateUz(r.created_at)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <RowActions
                        id={r.id}
                        name={nameOf(r)}
                        status={r.account_status}
                        self={r.id === me.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
