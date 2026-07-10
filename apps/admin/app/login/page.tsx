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
      : null;

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="card p-7 shadow-soft">
          <h1 className="text-[20px] font-bold text-ink">Boshqaruv paneli</h1>
          <p className="mb-6 mt-1 text-[13px] text-ink-soft">
            Faqat moderator va adminlar uchun.
          </p>
          <LoginForm initialError={initialError} />
        </div>
        <p className="mt-5 text-center text-[12px] text-ink-faint">
          talantly.uz — tekshirilgan amaliyotchilar platformasi
        </p>
      </div>
    </main>
  );
}
