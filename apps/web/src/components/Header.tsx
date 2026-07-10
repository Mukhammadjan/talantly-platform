import Link from "next/link";
import { BOT_URL } from "@/lib/links";
import { Logo } from "./Logo";

const NAV = [
  { href: "/talant", label: "Talantlarga" },
  { href: "/kompaniya", label: "Kompaniyalarga" },
  { href: "/narxlar", label: "Narxlar" },
  { href: "/aloqa", label: "Aloqa" },
];

export function Header(): JSX.Element {
  return (
    <header className="border-b border-line bg-cream">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Asosiy">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[14px] font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange px-5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all hover:bg-orange-deep active:scale-[0.98]"
        >
          Botni ochish
        </a>
      </div>
      <nav
        className="container-page flex gap-5 overflow-x-auto pb-3 md:hidden"
        aria-label="Asosiy (mobil)"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 text-[13px] font-semibold text-ink-soft"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
