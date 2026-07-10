"use client";

import type { ButtonHTMLAttributes } from "react";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "green" | "ghost";
  loading?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<PillButtonProps["variant"]>, string> =
  {
    primary:
      "bg-orange text-white shadow-soft active:bg-orange-deep",
    green: "bg-green text-white shadow-soft active:bg-green-deep",
    ghost:
      "bg-transparent text-orange border border-line active:bg-orange-tint",
  };

export function PillButton({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: PillButtonProps): JSX.Element {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`relative flex w-full items-center justify-center rounded-full py-4 text-[15px] font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        children
      )}
    </button>
  );
}
