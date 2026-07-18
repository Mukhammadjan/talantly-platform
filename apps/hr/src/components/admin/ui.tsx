import type { ReactNode } from "react";

// Admin UI yadro qismlari — ADAM referans patternlari, Talantly tokenlarida.

export const STATUS_LABELS: Record<string, string> = {
  yangi: "Yangi",
  malumot_toldirilgan: "Ma'lumot to'ldirilgan",
  tolov_kutilmoqda: "To'lov kutilmoqda",
  tolov_tasdiqlangan: "To'lov tasdiqlangan",
  cv_tayyor: "CV tayyor",
  test_otgan: "Test o'tgan",
  suhbat_belgilangan: "Suhbat belgilangan",
  tekshirilgan: "Tekshirilgan",
  rad_etilgan: "Rad etilgan",
  band: "Band",
};

export const DIRECTION_LABELS: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

/** Holat pill'i — referansdagi ikonli badge uslubi. */
export function StatusPill({ status }: { status: string }): JSX.Element {
  const ok = ["tekshirilgan", "tolov_tasdiqlangan", "test_otgan", "cv_tayyor"];
  const warn = ["tolov_kutilmoqda", "suhbat_belgilangan"];
  const bad = ["rad_etilgan"];
  const cls = ok.includes(status)
    ? "bg-verified-soft text-verified-ink"
    : bad.includes(status)
      ? "bg-danger-soft text-danger-ink"
      : warn.includes(status)
        ? "bg-action-soft text-action-ink"
        : "bg-fill text-ink-2";
  const mark = ok.includes(status) ? "✓ " : bad.includes(status) ? "✕ " : "";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-semibold whitespace-nowrap ${cls}`}
    >
      {mark}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/** Harf-avatar + ism + pastki matn — jadval katagi. */
export function PersonCell({
  name,
  sub,
}: {
  name: string;
  sub?: string | null;
}): JSX.Element {
  return (
    <span className="flex items-center gap-3 min-w-0">
      <span className="w-10 h-10 shrink-0 rounded-full bg-action-soft text-action-ink grid place-items-center font-bold text-[15px]">
        {(name || "?").charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-ink-1 truncate">
          {name || "—"}
        </span>
        {sub ? (
          <span className="block text-[12px] text-ink-2 truncate">{sub}</span>
        ) : null}
      </span>
    </span>
  );
}

/** Jadval kartasi: sarlavha + soni + o'ng tomonda filtrlar. */
export function TableCard({
  title,
  count,
  right,
  children,
}: {
  title: string;
  count?: string;
  right?: ReactNode;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="bg-white rounded-2xl border border-line p-6">
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h2 className="text-[19px] font-bold text-ink-1">{title}</h2>
          {count ? <p className="text-[13px] text-ink-2 mt-0.5">{count}</p> : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** SVG chiziqli grafik — kutubxonasiz, server-render. */
export function LineChart({
  labels,
  series,
  height = 240,
}: {
  labels: string[];
  series: { label: string; color: string; points: number[] }[];
  height?: number;
}): JSX.Element {
  const W = 900;
  const H = height;
  const padL = 44;
  const padB = 26;
  const padT = 10;
  const max = Math.max(1, ...series.flatMap((s) => s.points));
  const niceMax = Math.ceil(max / 4) * 4;
  const x = (i: number): number =>
    padL + (i * (W - padL - 8)) / Math.max(1, labels.length - 1);
  const y = (v: number): number =>
    padT + (H - padT - padB) * (1 - v / niceMax);
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Grafik"
      >
        {gridVals.map((v) => (
          <g key={v}>
            <line
              x1={padL}
              x2={W - 8}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--t-line)"
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={y(v) + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--t-ink-2)"
            >
              {v}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % Math.ceil(labels.length / 6) === 0 ? (
            <text
              key={l + i}
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              fontSize="11"
              fill="var(--t-ink-2)"
            >
              {l}
            </text>
          ) : null,
        )}
        {series.map((s) => (
          <polyline
            key={s.label}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={s.points.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-5 mt-3">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-2 text-[13px] text-ink-1">
            <span
              className="w-3 h-3 rounded"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Yarim-gauge donut — markazda umumiy son, ostида legend qatorlari. */
export function GaugeDonut({
  total,
  totalLabel,
  parts,
}: {
  total: string;
  totalLabel: string;
  parts: { label: string; value: number; color: string }[];
}): JSX.Element {
  const sum = Math.max(
    1,
    parts.reduce((s, p) => s + p.value, 0),
  );
  const R = 80;
  const CX = 110;
  const CY = 108;
  const SW = 22;
  // Yarim doira: 180° dan 0° gacha (chapdan o'ngga).
  let acc = 0;
  const arcs = parts.map((p) => {
    const a0 = Math.PI * (1 - acc / sum);
    acc += p.value;
    const a1 = Math.PI * (1 - acc / sum);
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY - R * Math.sin(a0);
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY - R * Math.sin(a1);
    const large = a0 - a1 > Math.PI ? 1 : 0;
    return {
      d: `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`,
      color: p.color,
      key: p.label,
    };
  });

  return (
    <div>
      <svg viewBox="0 0 220 118" className="w-full h-auto" role="img" aria-label={totalLabel}>
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="var(--t-fill)"
          strokeWidth={SW}
          strokeLinecap="round"
        />
        {arcs.map((a) => (
          <path
            key={a.key}
            d={a.d}
            fill="none"
            stroke={a.color}
            strokeWidth={SW}
            strokeLinecap="butt"
          />
        ))}
        <text
          x={CX}
          y={CY - 18}
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill="var(--t-ink-1)"
        >
          {total}
        </text>
        <text x={CX} y={CY} textAnchor="middle" fontSize="11" fill="var(--t-ink-2)">
          {totalLabel}
        </text>
      </svg>
      <div className="flex flex-col divide-y divide-line mt-2">
        {parts.map((p) => (
          <div key={p.label} className="flex items-center gap-2.5 py-2.5">
            <span className="w-3 h-3 rounded" style={{ background: p.color }} />
            <span className="text-[13px] text-ink-2 flex-1">{p.label}</span>
            <span className="text-[14px] font-bold text-ink-1 tabular-nums">
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
