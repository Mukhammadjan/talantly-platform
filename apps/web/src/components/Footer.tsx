import Link from "next/link";
import {
  BOT_START_IZLOVCHI,
  BOT_START_TALANT,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  CONTACT_TELEGRAM,
  CONTACT_TELEGRAM_URL,
} from "@/lib/links";
import { Logo } from "./Logo";

export function Footer(): JSX.Element {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-[260px] text-[13px] leading-relaxed text-ink-soft">
            O&apos;zbekistondagi tekshirilgan talantlar platformasi. Har bir
            nomzod 4 bosqichli tekshiruvdan o&apos;tadi.
          </p>
        </div>
        <div>
          <p className="label-caps">Sahifalar</p>
          <ul className="mt-3 space-y-2 text-[14px] font-medium">
            <li>
              <Link href="/talant" className="hover:text-orange">
                Talantlarga
              </Link>
            </li>
            <li>
              <Link href="/kompaniya" className="hover:text-orange">
                Kompaniyalarga
              </Link>
            </li>
            <li>
              <Link href="/narxlar" className="hover:text-orange">
                Narxlar
              </Link>
            </li>
            <li>
              <Link href="/aloqa" className="hover:text-orange">
                Aloqa
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="label-caps">Aloqa</p>
          <ul className="mt-3 space-y-2 text-[14px] font-medium">
            <li>
              <a href={CONTACT_TELEGRAM_URL} className="hover:text-orange">
                {CONTACT_TELEGRAM}
              </a>
            </li>
            <li>
              <a href={CONTACT_PHONE_HREF} className="hover:text-orange">
                {CONTACT_PHONE}
              </a>
            </li>
            <li>
              <a href={BOT_START_TALANT} className="hover:text-orange">
                Talant sifatida boshlash
              </a>
            </li>
            <li>
              <a href={BOT_START_IZLOVCHI} className="hover:text-orange">
                Talant izlash
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5">
        <p className="container-page text-[12px] text-ink-soft">
          © {new Date().getFullYear()} talantly.uz — tekshirilgan talantlar
          platformasi
        </p>
      </div>
    </footer>
  );
}
