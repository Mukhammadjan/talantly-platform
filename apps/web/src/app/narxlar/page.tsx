import type { Metadata } from "next";
import { PricingSection } from "@/components/PricingSection";

export const metadata: Metadata = {
  title: "Narxlar",
  description:
    "Talantlar uchun verifikatsiya bepul. Kompaniyalar to'lovi — faqat nomzod sinov muddatidan o'tgach. Ishlamasa — to'lamaysiz.",
};

export default function NarxlarPage(): JSX.Element {
  return (
    <section className="container-page pt-14 sm:pt-20">
      <div className="flex flex-col items-center text-center">
        <p className="label-caps">Narxlar</p>
        <h1 className="mt-3 max-w-2xl text-[30px] font-bold leading-tight tracking-tight sm:text-[40px]">
          Oddiy va halol narxlash
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
          Oldindan to&apos;lov yo&apos;q, obuna majburiyati yo&apos;q.
          Kompaniya faqat muvaffaqiyatli joylashuv uchun to&apos;laydi.
        </p>
      </div>
      <div className="mt-10">
        <PricingSection />
      </div>
    </section>
  );
}
