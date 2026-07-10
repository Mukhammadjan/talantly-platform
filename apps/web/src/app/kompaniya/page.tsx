import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Catalog } from "@/components/Catalog";
import { PillLink } from "@/components/PillLink";
import { PricingSection } from "@/components/PricingSection";
import { BOT_START_IZLOVCHI } from "@/lib/links";
import { getVerifiedTalents } from "@/lib/server/publicData";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kompaniyalarga",
  description:
    "Tekshirilgan yosh talantlar katalogi. 4 bosqichli verifikatsiya, to'lov faqat natijadan keyin — ishlamasa, to'lamaysiz.",
};

const VALUE_ITEMS = [
  {
    icon: "🛡",
    title: "Har bir nomzod tekshirilgan",
    text: "Xarakter testi + skill dalili + jonli suhbat. Muhrsiz hech kim katalogga chiqmaydi.",
  },
  {
    icon: "⚡",
    title: "Tez va oson",
    text: "Ming ta CV o'qish shart emas. Filtrlang, tanlang, bir bosishda so'rov yuboring.",
  },
  {
    icon: "🤝",
    title: "Risk bizda",
    text: "To'lov faqat nomzod sinov muddatidan muvaffaqiyatli o'tgach. Ishlamasa — to'lamaysiz.",
  },
];

export default async function KompaniyaPage(): Promise<JSX.Element> {
  const talents = await getVerifiedTalents();

  return (
    <>
      <section className="container-page pt-14 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <p className="label-caps">Kompaniyalar uchun</p>
          <h1 className="mt-3 max-w-2xl text-[30px] font-bold leading-tight tracking-tight sm:text-[40px]">
            Ishonchli yosh kadr — tanishlarsiz
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Tekshirilgan nomzodlar lentasini ko&apos;ring, mosini tanlang va
            bir bosishda so&apos;rov yuboring. Qolgan hamma ishni biz
            qilamiz — moslashtirish, tanishtiruv, kuzatuv.
          </p>
          <PillLink href={BOT_START_IZLOVCHI} external className="mt-8">
            Telegram orqali boshlash
          </PillLink>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {VALUE_ITEMS.map((item) => (
            <Card key={item.title}>
              <span className="text-[26px]" aria-hidden>
                {item.icon}
              </span>
              <h2 className="mt-2 text-[16px] font-bold">{item.title}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {item.text}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section id="katalog" className="container-page mt-20 scroll-mt-24">
        <p className="label-caps">Jonli katalog</p>
        <h2 className="mt-2 text-[26px] font-bold tracking-tight sm:text-[32px]">
          Tekshirilgan talantlar
        </h2>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-soft">
          Telefon raqamlari yopiq — aloqa faqat admin orqali. To&apos;liq
          profil va CV so&apos;rov yuborganingizdan keyin ochiladi.
        </p>
        <div className="mt-6">
          {talents.length > 0 ? (
            <Catalog talents={talents} />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-[14px] font-semibold">
                Katalog to&apos;ldirilmoqda
              </p>
              <p className="mt-1 text-[13px] text-ink-soft">
                Yangi tekshirilgan nomzodlar tez orada shu yerda paydo
                bo&apos;ladi. Telegramda birinchilardan bo&apos;lib
                ko&apos;ring.
              </p>
            </Card>
          )}
        </div>
      </section>

      <section id="narxlar" className="container-page mt-20 scroll-mt-24">
        <p className="label-caps">Narxlar</p>
        <h2 className="mt-2 text-[26px] font-bold tracking-tight sm:text-[32px]">
          To&apos;lov — faqat natijadan keyin
        </h2>
        <div className="mt-6">
          <PricingSection />
        </div>
      </section>
    </>
  );
}
