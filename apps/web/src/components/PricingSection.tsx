import { Card } from "./Card";
import { PillLink } from "./PillLink";
import { BOT_START_IZLOVCHI } from "@/lib/links";

const PLANS = [
  {
    name: "Intern joylashuvi",
    price: "800 000 so'm",
    note: "oddiy yo'nalishlar",
    features: [
      "Tekshirilgan intern nomzodlar",
      "Admin orqali moslashtirish",
      "Sinov muddati kafolati",
    ],
  },
  {
    name: "Tech / dizayn intern",
    price: "1 500 000 so'm",
    note: "dasturlash, dizayn, data",
    features: [
      "Texnik yo'nalishdagi interlar",
      "Skill ball + portfolio dalili",
      "Sinov muddati kafolati",
    ],
    highlight: true,
  },
  {
    name: "Mutaxassis joylashuvi",
    price: "Birinchi oylikning ~50%",
    note: "minimal 2 000 000 so'm",
    features: [
      "Tajribali tekshirilgan mutaxassislar",
      "Suhbat bahosi + arxetip mosligi",
      "Sinov muddati kafolati",
    ],
  },
];

export function PricingSection(): JSX.Element {
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlight ? "border-orange" : ""}
          >
            <p className="label-caps">{plan.name}</p>
            <p className="mt-2 text-[24px] font-bold leading-tight">
              {plan.price}
            </p>
            <p className="text-[12px] text-ink-soft">{plan.note}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-[13px] text-ink-soft"
                >
                  <span className="mt-0.5 text-green-deep" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-4 flex flex-col items-center gap-2 bg-green-tint py-6 text-center">
        <p className="text-[18px] font-bold text-green-deep">
          Ishlamasa — to&apos;lamaysiz 🤝
        </p>
        <p className="max-w-lg text-[13px] leading-relaxed text-ink-soft">
          To&apos;lov faqat nomzod sinov muddatidan muvaffaqiyatli
          o&apos;tgandan keyin. Oldindan to&apos;lov yo&apos;q, yashirin
          to&apos;lov yo&apos;q.
        </p>
      </Card>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-[13px] text-ink-soft">
          Talantlar uchun verifikatsiya <strong>bepul</strong>. Obuna rejalari —
          tez orada.
        </p>
        <PillLink href={BOT_START_IZLOVCHI} external>
          Izlashni boshlash
        </PillLink>
      </div>
    </div>
  );
}
