import Link from "next/link";
import { Seal } from "./Seal";

export function Logo({ className = "" }: { className?: string }): JSX.Element {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="talantly — bosh sahifa"
    >
      <Seal size={28} />
      <span className="text-[20px] font-bold tracking-tight text-ink">
        talantly
      </span>
    </Link>
  );
}
