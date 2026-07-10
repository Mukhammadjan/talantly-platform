import Link from "next/link";
import { Seal } from "@/components/Seal";

export default function NotFound(): JSX.Element {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Seal size={56} className="opacity-60" />
      <p className="mt-6 text-[48px] font-bold tracking-tight">404</p>
      <h1 className="mt-2 text-[20px] font-bold">Sahifa topilmadi</h1>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-soft">
        Bu manzil mavjud emas yoki ko&apos;chirilgan. Bosh sahifadan davom
        eting.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-orange px-6 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-orange-deep active:scale-95"
      >
        Bosh sahifaga qaytish
      </Link>
    </section>
  );
}
