import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-5 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
