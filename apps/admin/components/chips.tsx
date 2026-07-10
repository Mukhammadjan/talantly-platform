import type { TalentLevel, TalentStatus } from "@talantly/shared";
import { LEVEL_LABELS, STATUS_LABELS } from "@/lib/labels";

const STATUS_STYLES: Record<TalentStatus, string> = {
  yangi: "bg-cream text-ink-soft",
  malumot_toldirilgan: "bg-cream text-ink-soft",
  tolov_kutilmoqda: "bg-orange-tint text-orange",
  tolov_tasdiqlangan: "bg-orange-tint text-orange",
  cv_tayyor: "bg-orange-tint text-orange",
  test_otgan: "bg-orange-tint text-orange",
  suhbat_belgilangan: "bg-orange-tint text-orange",
  tekshirilgan: "bg-green-tint text-green-deep",
  rad_etilgan: "bg-red-tint text-red",
};

export function StatusChip({ status }: { status: TalentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${STATUS_STYLES[status]}`}
    >
      {status === "tekshirilgan" ? <SealMark /> : null}
      {STATUS_LABELS[status]}
    </span>
  );
}

function SealMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
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
  );
}

export function LevelChip({ level }: { level: TalentLevel | null }) {
  if (!level) return <span className="text-[13px] text-ink-faint">—</span>;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-semibold ${
        level === "mutaxassis"
          ? "border-[rgba(242,100,48,0.4)] text-orange"
          : "border-line text-ink-soft"
      }`}
    >
      {level === "intern" ? "🌱 " : "💼 "}
      {LEVEL_LABELS[level]}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {children}
    </span>
  );
}
