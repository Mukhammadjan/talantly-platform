import { requireRole } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/service";
import { SettingsForm, type SettingsValues } from "./SettingsForm";

export const dynamic = "force-dynamic";

async function loadSettings(): Promise<SettingsValues> {
  const db = getServiceClient();
  const { data } = await db.from("settings").select("key, value");
  const map = new Map(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [
      r.key,
      r.value,
    ]),
  );
  const s = (k: string): string => map.get(k) ?? "";
  const b = (k: string): boolean => (map.get(k) ?? "").toLowerCase() === "true";
  return {
    cv_price: s("cv_price"),
    contact_unlock_price: s("contact_unlock_price"),
    subscription_price: s("subscription_price"),
    success_fee_intern: s("success_fee_intern"),
    success_fee_mutaxassis: s("success_fee_mutaxassis"),
    success_fee_tech: s("success_fee_tech"),
    payment_card_number: s("payment_card_number"),
    payment_card_owner: s("payment_card_owner"),
    show_demo_data: b("show_demo_data"),
    cv_payment_required: b("cv_payment_required"),
  };
}

export default async function SozlamalarPage() {
  await requireRole("admin");
  const values = await loadSettings();

  return (
    <div className="mx-auto max-w-[900px]">
      <header className="mb-6">
        <h1 className="page-title">Sozlamalar</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Narxlar, to&apos;lov kartasi va rejim. O&apos;zgarishlar darhol
          kuchga kiradi.
        </p>
      </header>
      <SettingsForm values={values} />
    </div>
  );
}
