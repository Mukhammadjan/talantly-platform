import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { PillLink } from "@/components/PillLink";
import { Seal } from "@/components/Seal";
import { BOT_START_TALANT } from "@/lib/links";

export const metadata: Metadata = {
  title: "Talantlarga",
  description:
    "Bepul tekshiruvdan o'ting, yashil muhr va professional CV oling. Tajribasiz ham ish topishning isbotlangan yo'li.",
};

const STEPS = [
  {
    icon: "📱",
    title: "Telegramda boshlaysiz",
    text: "Bot raqamingizni bir bosishda oladi, Mini App'da 3 daqiqalik profil to'ldirasiz — hech qanday CV yozish shart emas.",
  },
  {
    icon: "🧭",
    title: "Xarakter testini topshirasiz",
    text: "15 qisqa savol — to'g'ri javob yo'q. Natijada karyera arxetipingizni bilasiz: qaysi ishda porlashingizni.",
  },
  {
    icon: "🧪",
    title: "Skill testdan o'tasiz",
    text: "Yo'nalishingizga mos 10 savol + portfolio. Bilimingizni gapirib emas, isbotlab ko'rsatasiz.",
  },
  {
    icon: "🎙",
    title: "Jonli suhbatga kirasiz",
    text: "Moderator siz bilan qisqa onlayn suhbat o'tkazadi — muloqot, xarakter va motivatsiyani baholaydi.",
  },
  {
    icon: "✅",
    title: "Muhr va CV olasiz",
    text: "Tekshiruvdan o'tganingiz uchun yashil muhr + AI tayyorlagan professional CV — sovg'a sifatida.",
  },
  {
    icon: "🙌",
    title: "Takliflar sizni topadi",
    text: "Sizga mos kompaniya so'rovlarini ko'rasiz, \"Men tayyorman\" tugmasini bosasiz — qolganini biz hal qilamiz.",
  },
];

const BENEFITS = [
  {
    icon: "🆓",
    title: "Verifikatsiya bepul",
    text: "Tekshiruvning barcha bosqichlari talant uchun tekin. Filtr — pul emas, sifat.",
  },
  {
    icon: "🏅",
    title: "Muhr — ishonch belgisi",
    text: "Yashil \"Tekshirilgan\" muhri kompaniyaga siz haqingizda uch o'lchamda dalil beradi.",
  },
  {
    icon: "📄",
    title: "Professional CV sovg'a",
    text: "Tekshiruvdan o'tgach AI sizning dalillaringizdan chiroyli CV PDF yaratib beradi.",
  },
  {
    icon: "🔒",
    title: "Raqamingiz yopiq",
    text: "Telefoningiz hech qachon ochiq ko'rsatilmaydi — aloqa faqat admin orqali.",
  },
];

export default function TalantPage(): JSX.Element {
  return (
    <>
      <section className="container-page pt-14 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <p className="label-caps">Yoshlar uchun</p>
          <h1 className="mt-3 max-w-2xl text-[30px] font-bold leading-tight tracking-tight sm:text-[40px]">
            Tajribasiz ham ish topiladi — dalil bilan
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            &quot;Tajriba yo&apos;q — ish yo&apos;q, ish yo&apos;q — tajriba
            yo&apos;q&quot; aylanasini buzamiz. Siz tekshiruvdan o&apos;tasiz,
            biz sizni ishonchli kompaniyalarga tavsiya qilamiz.
          </p>
          <PillLink href={BOT_START_TALANT} external className="mt-8">
            Telegram orqali boshlash
          </PillLink>
        </div>
      </section>

      <section className="container-page mt-20">
        <p className="label-caps text-center">Qanday ishlaydi</p>
        <h2 className="mt-2 text-center text-[26px] font-bold tracking-tight sm:text-[32px]">
          6 qadam — muhrgacha
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
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
        <p className="label-caps text-center">Sizga nima beradi</p>
        <h2 className="mt-2 text-center text-[26px] font-bold tracking-tight sm:text-[32px]">
          Muhr ortidagi imkoniyatlar
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((item) => (
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

      <section className="container-page mt-20">
        <p className="label-caps text-center">Namuna</p>
        <h2 className="mt-2 text-center text-[26px] font-bold tracking-tight sm:text-[32px]">
          Tekshirilgan profil qanday ko&apos;rinadi
        </h2>
        <div className="mx-auto mt-8 max-w-md">
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange text-[20px] font-bold text-white">
                D
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[16px] font-bold">
                  Dilnoza R. <Seal size={18} />
                </p>
                <p className="text-[12px] text-ink-soft">
                  Dizayn · Toshkent · 🌱 Intern
                </p>
              </div>
            </div>
            <p className="mt-3 text-[13px] italic leading-relaxed text-ink-soft">
              &quot;Brendlarga zamonaviy vizual til yaratishni o&apos;rganyapman&quot;
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-orange-tint px-2.5 py-1 text-[11px] font-semibold text-orange-deep">
                🎨 Yaratuvchi
              </span>
              <span className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                Figma
              </span>
              <span className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                UX/UI
              </span>
              <span className="rounded-full border border-line bg-cream px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                Brending
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
              <span className="rounded-full bg-green-tint px-2.5 py-1 text-[12px] font-bold text-green-deep">
                90 ball
              </span>
              <span className="text-[12px] font-semibold text-orange">
                ★★★★★
              </span>
            </div>
          </Card>
          <p className="mt-3 text-center text-[12px] text-ink-soft">
            Namuna profil — sizniki ham shunday ko&apos;rinadi.
          </p>
        </div>
      </section>

      <section className="container-page mt-20">
        <Card className="flex flex-col items-center py-10 text-center">
          <Seal size={56} className="seal-pop" />
          <h2 className="mt-4 text-[24px] font-bold tracking-tight">
            Birinchi qadamni hoziroq tashlang
          </h2>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
            Ro&apos;yxatdan o&apos;tish 3 daqiqa. Tekshiruv bepul. Muhr —
            umrbod dalil.
          </p>
          <PillLink href={BOT_START_TALANT} external className="mt-6">
            Telegram orqali boshlash
          </PillLink>
        </Card>
      </section>
    </>
  );
}
