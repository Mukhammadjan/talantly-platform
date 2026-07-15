"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./icons";

const FALLBACK_TONE = { bg: "#FFE7DC", fg: "#C6461B" };
const TONE: Record<string, { bg: string; fg: string }> = {
  orange: FALLBACK_TONE,
  blue: { bg: "#DCE7FF", fg: "#2451C7" },
  green: { bg: "#DAF2E5", fg: "#178049" },
  purple: { bg: "#E7DEFB", fg: "#6B3FD1" },
};

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  tone = "orange",
  size = 52,
  blurred = false,
}: {
  name: string;
  tone?: string;
  size?: number;
  blurred?: boolean;
}): JSX.Element {
  const t = TONE[tone] ?? FALLBACK_TONE;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: t.bg,
        color: t.fg,
        fontSize: size * 0.36,
        filter: blurred ? "blur(6px)" : undefined,
      }}
    >
      {initials(name)}
    </div>
  );
}

export function VerifiedSeal({
  compact = false,
}: {
  compact?: boolean;
}): JSX.Element {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-pill bg-green-soft font-semibold text-green"
      style={{
        padding: compact ? "3px 8px" : "5px 10px",
        fontSize: compact ? 11 : 12.5,
      }}
    >
      <Icon name="check" size={compact ? 13 : 15} />
      Tekshirilgan
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-chip bg-surface2 px-2 py-1 text-[13px] font-semibold text-text">
      <Icon name="star" size={14} className="text-orange" />
      <span className="num">{score}</span>
    </span>
  );
}

export function SkillTag({ label }: { label: string }): JSX.Element {
  return (
    <span className="rounded-chip bg-surface2 px-2.5 py-1 text-[12.5px] font-medium text-muted">
      {label}
    </span>
  );
}

export function Chip({
  label,
  active = false,
  icon,
  onClick,
}: {
  label: string;
  active?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
        active
          ? "border-transparent bg-text text-white"
          : "border-line bg-surface text-muted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  children,
  variant = "primary",
  full = false,
  icon,
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  full?: boolean;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-btn px-5 py-3.5 text-[15px] font-semibold transition-transform active:scale-[0.98] disabled:opacity-50";
  const styles: Record<Variant, string> = {
    primary: "bg-orange text-white",
    secondary: "bg-surface2 text-text",
    ghost: "bg-transparent text-orange",
  };
  return (
    <button
      type="button"
      className={`${base} ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
