import type { ReactNode } from "react";

const VARIANT_CLASSES = {
  primary: "bg-orange text-white shadow-soft hover:bg-orange-deep",
  green: "bg-green text-white shadow-soft hover:bg-green-deep",
  ghost: "bg-transparent text-orange border border-line hover:bg-orange-tint",
} as const;

export function PillLink({
  href,
  variant = "primary",
  className = "",
  children,
  external = false,
}: {
  href: string;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
  children: ReactNode;
  external?: boolean;
}): JSX.Element {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-semibold transition-all duration-150 active:scale-[0.98] ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
