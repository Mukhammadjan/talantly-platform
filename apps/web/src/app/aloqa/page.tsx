import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { PillLink } from "@/components/PillLink";
import {
  BOT_URL,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  CONTACT_TELEGRAM,
  CONTACT_TELEGRAM_URL,
} from "@/lib/links";

export const metadata: Metadata = {
  title: "Aloqa",
  description:
    "talantly jamoasi bilan bog'lanish: Telegram @talantly yoki +998 99-030-73-22.",
};

const CHANNELS = [
  {
    icon: "💬",
    title: "Telegram",
    value: CONTACT_TELEGRAM,
    href: CONTACT_TELEGRAM_URL,
    note: "Eng tez javob — odatda bir necha soat ichida",
  },
  {
    icon: "📞",
    title: "Telefon",
    value: CONTACT_PHONE,
    href: CONTACT_PHONE_HREF,
    note: "Ish kunlari 10:00 – 19:00 (Toshkent vaqti)",
  },
  {
    icon: "🤖",
    title: "Bot",
    value: "@Talantly_bot",
    href: BOT_URL,
    note: "Ro'yxatdan o'tish va so'rovlar shu yerda",
  },
];

export default function AloqaPage(): JSX.Element {
  return (
    <section className="container-page pt-14 sm:pt-20">
      <div className="flex flex-col items-center text-center">
        <p className="label-caps">Aloqa</p>
        <h1 className="mt-3 max-w-2xl text-[30px] font-bold leading-tight tracking-tight sm:text-[40px]">
          Savolingiz bormi? Yozing
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Hamkorlik, taklif yoki oddiy savol — jamoamiz har bir xabarni
          o&apos;qiydi va javob beradi.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
        {CHANNELS.map((channel) => (
          <a
            key={channel.title}
            href={channel.href}
            target={channel.href.startsWith("tel:") ? undefined : "_blank"}
            rel={
              channel.href.startsWith("tel:")
                ? undefined
                : "noopener noreferrer"
            }
            className="group rounded-card border border-line bg-surface p-6 text-center shadow-soft transition-all hover:border-orange"
          >
            <span className="text-[30px]" aria-hidden>
              {channel.icon}
            </span>
            <p className="label-caps mt-3">{channel.title}</p>
            <p className="mt-1 text-[16px] font-bold text-orange group-hover:text-orange-deep">
              {channel.value}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
              {channel.note}
            </p>
          </a>
        ))}
      </div>

      <Card className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 py-8 text-center">
        <p className="text-[16px] font-bold">
          Kompaniya sifatida nomzod kerakmi?
        </p>
        <p className="max-w-md text-[13px] leading-relaxed text-ink-soft">
          Telegram botda 1 daqiqalik so&apos;rov qoldiring — jamoamiz siz
          bilan bog&apos;lanadi va mos nomzodlarni taklif qiladi.
        </p>
        <PillLink href={BOT_URL} external className="mt-2">
          Botni ochish
        </PillLink>
      </Card>
    </section>
  );
}
