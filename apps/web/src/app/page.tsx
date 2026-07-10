import Link from "next/link";
import { Card } from "@/components/Card";
import { PillLink } from "@/components/PillLink";
import { Seal } from "@/components/Seal";
import { TalentCard } from "@/components/TalentCard";
import { BOT_START_IZLOVCHI, BOT_START_TALANT } from "@/lib/links";
import { getPublicStats, getVerifiedTalents } from "@/lib/server/publicData";

export const revalidate = 300;

const VERIFICATION_STEPS = [
  {
    icon: "🧭",
    title: "Xarakter testi",
    text: "15 savollik test karyera arxetipini aniqlaydi: Yaratuvchi, Tahlilchi, Yetakchi va boshqalar.",
  },
  {
    icon: "🧪",
    title: "Skill dalili",
    text: "Yo'nalishga mos skill test va portfolio — gapirib emas, isbotlab ko'rsatadi.",
  },
  {
    icon: "🎙",
    title: "Jonli suhbat",
    text: "Moderator har bir nomzod bilan onlayn suhbat o'tkazadi va 1–5 ball bilan baholaydi.",
  },
  {
    icon: "✅",
    title: "Tekshirilgan muhr",
    text: "Arxetip + skill ball + suhbat bahosi birlashib, yashil muhrga aylanadi. Biz rad ham etamiz — shu uchun muhr qadrli.",
  },
];

const WHY_ITEMS = [
  {
    icon: "🎯",
    title: "Fokus",
    text: "Faqat tekshirilgan yosh talantlar. Ming ta CV emas — saralangan pool.",
  },
  {
    icon: "🛡",
    title: "Verifikatsiya",
    text: "Har bir nomzod 4 bosqichli tekshiruvdan o'tadi. Muhrsiz hech kim ko'rinmaydi.",
  },
  {
    icon: "🤝",
    title: "Ishlamasa — to'lamaysiz",
    text: "To'lov faqat nomzod sinov muddatidan o'tgach. Risk bizda, natija sizda.",
  },
  {
    icon: "📐",
    title: "3 o'lcham",
    text: "KIM (xarakter) · NIMA QILADI (skill + portfolio) · QANDAY (jonli suhbat bahosi).",
  },
];

export default async function HomePage(): Promise<JSX.Element> {
  const [stats, talents] = await Promise.all([
    getPublicStats(),
    getVerifiedTalents(),
  ]);
  const teaser = talents.slice(0, 6);

  return (
    <>
      <section className="container-page pt-14 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <Seal size={64} className="seal-pop" />
          <h1 className="mt-6 max-w-2xl text-[32px] font-bold leading-tight tracking-tight sm:text-[44px]">
            Tekshirilgan yosh talantlar
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">
            O&apos;zbekistonda yoshlar tajribasiz ish topa olmaydi, kompaniyalar
            esa ishonchli yosh kadr topa olmaydi. talantly buni verifikatsiya
            bilan yechadi: har bir nomzod 4 bosqichli tekshiruvdan o&apos;tadi.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <a
            href={BOT_START_TALANT}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-card border border-line bg-surface p-6 text-left shadow-soft transition-all hover:border-orange"
          >
            <span className="text-[32px]" aria-hidden>
              🌟
            </span>
            <h2 className="mt-3 text-[19px] font-bold">Men talantman</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
              Bepul tekshiruvdan o&apos;ting, yashil muhr va professional CV
              oling — ish takliflari sizni topadi.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-orange group-hover:gap-2">
              Telegram orqali boshlash →
            </span>
          </a>
          <a
            href={BOT_START_IZLOVCHI}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-card border border-line bg-surface p-6 text-left shadow-soft transition-all hover:border-orange"
          >
            <span className="text-[32px]" aria-hidden>
              🔎
            </span>
            <h2 className="mt-3 text-[19px] font-bold">Talant izlayapman</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
              Tekshirilgan nomzodlar lentasini ko&apos;ring va bir bosishda
              so&apos;rov yuboring. To&apos;lov — faqat natijadan keyin.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-orange group-hover:gap-2">
              Nomzodlarni ko&apos;rish →
            </span>
          </a>
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4">
          <Card className="text-center">
            <p className="text-[36px] font-bold text-green-deep">
              {stats.verifiedTalents}
            </p>
            <p className="label-caps mt-1">Tekshirilgan talant</p>
          </Card>
          <Card className="text-center">
            <p className="text-[36px] font-bold text-orange">
              {stats.companies}
            </p>
            <p className="label-caps mt-1">Izlovchi kompaniya</p>
          </Card>
        </div>
      </section>

      <section className="container-page mt-20">
        <p className="label-caps text-center">Verifikatsiya dvigateli</p>
        <h2 className="mt-2 text-center text-[26px] font-bold tracking-tight sm:text-[32px]">
          Muhrgacha 4 bosqich
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VERIFICATION_STEPS.map((step, index) => (
            <Card key={step.title}>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-[22px]"
                  aria-hidden
                >
                  {step.icon}
                </span>
                <span className="text-[13px] font-bold text-ink-faint">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-[16px] font-bold">{step.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {step.text}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <p className="label-caps text-center">Nega talantly</p>
        <h2 className="mt-2 text-center text-[26px] font-bold tracking-tight sm:text-[32px]">
          hh.uz ham, LinkedIn ham bermaydigan narsa
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_ITEMS.map((item) => (
            <Card key={item.title}>
              <span className="text-[26px]" aria-hidden>
                {item.icon}
              </span>
              <h3 className="mt-2 text-[16px] font-bold">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                {item.text}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {teaser.length > 0 && (
        <section className="container-page mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-caps">Jonli katalog</p>
              <h2 className="mt-2 text-[26px] font-bold tracking-tight sm:text-[32px]">
                Tekshirilgan talantlar
              </h2>
            </div>
            <Link
              href="/kompaniya#katalog"
              className="text-[14px] font-semibold text-orange hover:text-orange-deep"
            >
              Hammasini ko&apos;rish →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teaser.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <PillLink href={BOT_START_IZLOVCHI} external>
              Batafsil Telegramda
            </PillLink>
          </div>
        </section>
      )}
    </>
  );
}
