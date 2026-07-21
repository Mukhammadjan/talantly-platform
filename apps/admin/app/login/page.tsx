import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { xato?: string };
}) {
  const initialError =
    searchParams.xato === "huquq"
      ? "Bu hisobda admin panelga kirish huquqi yo'q."
      : searchParams.xato === "muzlatilgan"
        ? "Hisob muzlatilgan. Administrator bilan bog'laning."
        : null;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-6">
      {/* Iliq ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[560px] -translate-x-1/2 rounded-full bg-orange/10 blur-[90px]"
      />
      <div className="relative w-full max-w-[400px]">
        <div className="mb-7 flex justify-center">
          <Logo size={38} />
        </div>
        <div className="card p-8 shadow-float">
          <span className="label-caps">Boshqaruv paneli</span>
          <h1 className="mt-1.5 text-[24px] font-bold tracking-[-0.01em] text-ink">
            Xush kelibsiz
          </h1>
          <p className="mb-7 mt-1 text-[13px] text-ink-soft">
            Telefon va parolingiz bilan kiring. Faqat moderator va adminlar
            uchun.
          </p>
          <LoginForm initialError={initialError} />
        </div>
        <p className="mt-6 text-center text-[12px] text-ink-faint">
          talantly.uz — tekshirilgan amaliyotchilar platformasi
        </p>
      </div>
    </main>
  );
}
