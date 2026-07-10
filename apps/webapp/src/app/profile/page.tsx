"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CV_PRICE_UZS,
  DIRECTION_LABELS_UZ,
  type TalentStatus,
} from "@talantly/shared";
import { Card } from "@/components/Card";
import { PillButton } from "@/components/PillButton";
import { Seal } from "@/components/Seal";
import { Skeleton } from "@/components/Skeleton";
import { apiFetch, isInsideTelegram } from "@/lib/api";
import type { TalentSnapshot } from "@/lib/apiTypes";
import { addDaysIso, formatDateTimeUz, formatDateUz } from "@/lib/format";
import { getWebApp, haptic, initTelegramUi, openExternalLink } from "@/lib/telegram";

const STATUS_RANK: Record<TalentStatus, number> = {
  yangi: 0,
  malumot_toldirilgan: 1,
  tolov_kutilmoqda: 2,
  tolov_tasdiqlangan: 3,
  cv_tayyor: 4,
  test_otgan: 5,
  suhbat_belgilangan: 6,
  tekshirilgan: 7,
  rad_etilgan: 7,
};

const TIMELINE: { label: string; doneAt: number; payment?: boolean }[] = [
  { label: "Ro'yxatdan o'tish", doneAt: 1 },
  { label: "To'lov", doneAt: 3, payment: true },
  { label: "AI CV", doneAt: 4 },
  { label: "Skill test", doneAt: 5 },
  { label: "Suhbat", doneAt: 6 },
  { label: "Tekshirilgan", doneAt: 7 },
];

interface PaymentInfo {
  cardNumber: string | null;
  cardOwner: string | null;
  price: number;
}

function formatCard(cardNumber: string): string {
  return cardNumber.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
}

function Timeline({
  status,
  paymentEnabled,
}: {
  status: TalentStatus;
  paymentEnabled: boolean;
}): JSX.Element {
  const rank = STATUS_RANK[status];
  const rejected = status === "rad_etilgan";
  const steps = paymentEnabled
    ? TIMELINE
    : TIMELINE.filter((item) => !item.payment);
  return (
    <Card>
      <p className="label-caps">Tekshiruv yo&apos;li</p>
      <div className="mt-4 space-y-0">
        {steps.map((item, index) => {
          const done = !rejected && rank >= item.doneAt;
          const isCurrent =
            !rejected &&
            !done &&
            (index === 0 || rank >= (steps[index - 1]?.doneAt ?? 0));
          const isLast = index === steps.length - 1;
          return (
            <div key={item.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                {done ? (
                  <Seal size={24} />
                ) : (
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isCurrent
                        ? "border-orange soft-pulse"
                        : "border-line"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isCurrent ? "bg-orange" : "bg-line"
                      }`}
                    />
                  </span>
                )}
                {!isLast && (
                  <span
                    className={`w-0.5 flex-1 ${done ? "bg-green" : "bg-line"}`}
                    style={{ minHeight: 18 }}
                  />
                )}
              </div>
              <p
                className={`pb-4 pt-0.5 text-[14px] ${
                  done
                    ? "font-semibold text-ink"
                    : isCurrent
                      ? "font-semibold text-orange"
                      : "text-ink-soft"
                }`}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PaymentCard(): JSX.Element {
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<PaymentInfo>("/api/payment-info")
      .then(setInfo)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <Card>
        <p className="text-[14px] text-ink-soft">
          To&apos;lov ma&apos;lumotlarini yuklab bo&apos;lmadi. Ilovani qayta
          oching.
        </p>
      </Card>
    );
  }

  if (!info) {
    return (
      <Card>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-3 h-8 w-3/4" />
        <Skeleton className="mt-3 h-4 w-2/3" />
      </Card>
    );
  }

  const copy = async (): Promise<void> => {
    if (!info.cardNumber) return;
    try {
      await navigator.clipboard.writeText(info.cardNumber.replace(/\s/g, ""));
      haptic("success");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      haptic("error");
    }
  };

  return (
    <Card>
      <p className="label-caps">Keyingi qadam</p>
      <h2 className="mt-2 text-[17px] font-bold">
        AI CV — {formatPrice(info.price ?? CV_PRICE_UZS)}
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Professional CV va tekshiruv uchun bir martalik to&apos;lov. Quyidagi
        kartaga o&apos;tkazing va chek skrinshotini botga yuboring.
      </p>

      {info.cardNumber ? (
        <>
          <div className="mt-4 rounded-input border border-line bg-cream p-4">
            <p className="text-[17px] font-bold tracking-wider">
              {formatCard(info.cardNumber)}
            </p>
            {info.cardOwner && (
              <p className="mt-1 text-[13px] text-ink-soft">{info.cardOwner}</p>
            )}
            <button
              type="button"
              onClick={() => void copy()}
              className="mt-3 rounded-full border border-orange px-4 py-1.5 text-[13px] font-semibold text-orange transition-all active:scale-95"
            >
              {copied ? "Nusxalandi ✓" : "Nusxalash"}
            </button>
          </div>
          <PillButton className="mt-4" onClick={() => getWebApp()?.close()}>
            Chekni botga yuborish
          </PillButton>
          <p className="mt-2 text-center text-[12px] text-ink-soft">
            Tugma sizni bot chatiga qaytaradi — chek skrinshotini o&apos;sha
            yerga yuboring.
          </p>
        </>
      ) : (
        <p className="mt-4 rounded-input border border-line bg-cream p-4 text-[13px] leading-relaxed text-ink-soft">
          To&apos;lov rekvizitlari vaqtincha mavjud emas. Iltimos, botdagi
          /yordam bo&apos;limi orqali admin bilan bog&apos;laning.
        </p>
      )}
    </Card>
  );
}

function CvButton(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const openCv = async (): Promise<void> => {
    setLoading(true);
    setError(false);
    try {
      const { url } = await apiFetch<{ url: string }>("/api/cv");
      openExternalLink(url);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PillButton
        variant="ghost"
        className="mt-3"
        loading={loading}
        onClick={() => void openCv()}
      >
        CV ni ko&apos;rish
      </PillButton>
      {error && (
        <p className="mt-2 text-center text-[12px] text-orange-deep">
          CV faylini ochib bo&apos;lmadi. Qayta urinib ko&apos;ring.
        </p>
      )}
    </>
  );
}

function ActionCard({ snapshot }: { snapshot: TalentSnapshot }): JSX.Element {
  const router = useRouter();

  switch (snapshot.status) {
    case "malumot_toldirilgan":
      if (!snapshot.paymentEnabled) {
        return (
          <Card className="soft-pulse">
            <p className="label-caps">AI ishlamoqda</p>
            <h2 className="mt-2 text-[17px] font-bold">
              CV tayyorlanmoqda... ✨
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              AI sizning ma&apos;lumotlaringizdan professional CV yaratmoqda.
              Tayyor bo&apos;lgach botda yuboramiz.
            </p>
          </Card>
        );
      }
      return <PaymentCard />;

    case "tolov_kutilmoqda":
      return (
        <Card className="soft-pulse">
          <p className="label-caps">To&apos;lov tekshirilmoqda</p>
          <h2 className="mt-2 text-[17px] font-bold">Chekingiz qabul qilindi</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Moderator to&apos;lovni 24 soat ichida tasdiqlaydi. Tasdiqlangach
            sizga botda xabar beramiz.
          </p>
        </Card>
      );

    case "tolov_tasdiqlangan":
      return (
        <Card className="soft-pulse">
          <p className="label-caps">AI ishlamoqda</p>
          <h2 className="mt-2 text-[17px] font-bold">
            CV tayyorlanmoqda... ✨
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            AI sizning ma&apos;lumotlaringizdan professional CV yaratmoqda.
            Tayyor bo&apos;lgach botda yuboramiz.
          </p>
        </Card>
      );

    case "cv_tayyor":
      return (
        <Card>
          <p className="label-caps">Keyingi qadam</p>
          <h2 className="mt-2 text-[17px] font-bold">
            {snapshot.cvAvailable
              ? "CV tayyor! 🎉"
              : "Skill test sizni kutmoqda"}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Endi {snapshot.direction ? DIRECTION_LABELS_UZ[snapshot.direction] : ""}{" "}
            yo&apos;nalishi bo&apos;yicha 10 savollik skill testdan o&apos;ting.
          </p>
          <PillButton className="mt-4" onClick={() => router.push("/test")}>
            Skill testni boshlash
          </PillButton>
          {snapshot.cvAvailable && <CvButton />}
        </Card>
      );

    case "test_otgan":
      return (
        <Card>
          <p className="label-caps">Keyingi qadam</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-[18px] font-bold text-green-deep">
              {snapshot.score ?? "—"}
            </span>
            <div>
              <h2 className="text-[17px] font-bold">Test topshirildi!</h2>
              <p className="text-[13px] text-ink-soft">100 balldan</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Yakuniy bosqich — moderator bilan qisqa onlayn suhbat. O&apos;zingizga
            qulay vaqtni tanlang.
          </p>
          <PillButton className="mt-4" onClick={() => router.push("/booking")}>
            Suhbat vaqtini tanlash
          </PillButton>
        </Card>
      );

    case "suhbat_belgilangan":
      return (
        <Card>
          <p className="label-caps">Suhbat belgilandi</p>
          <h2 className="mt-2 text-[17px] font-bold">
            {snapshot.interviewAt
              ? formatDateTimeUz(snapshot.interviewAt)
              : "Vaqt tez orada aniqlanadi"}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Suhbat onlayn o&apos;tadi — moderator siz bilan bog&apos;lanadi.
            Boshlanishidan 1 soat oldin botda eslatma yuboramiz.
          </p>
        </Card>
      );

    case "tekshirilgan":
      return (
        <Card className="flex flex-col items-center text-center">
          <Seal size={72} className="seal-pop" />
          <h2 className="mt-4 text-[20px] font-bold text-green-deep">
            Siz tekshirilgan talantsiz!
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Tabriklaymiz! Endi profilingiz ishonchli kompaniyalarga tavsiya
            qilinadi. Mos taklif chiqsa, sizga botda xabar beramiz.
          </p>
        </Card>
      );

    case "rad_etilgan": {
      const retryDate = snapshot.rejectedAt
        ? formatDateUz(addDaysIso(snapshot.rejectedAt, 30))
        : null;
      return (
        <Card>
          <p className="label-caps">Natija</p>
          <h2 className="mt-2 text-[17px] font-bold">
            Bu safar yakunlay olmadik
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
            Xafa bo&apos;lmang — bu yo&apos;lning oxiri emas. Bilimlaringizni
            mustahkamlab, qayta urinib ko&apos;ring.{" "}
            {retryDate
              ? `${retryDate} kunidan boshlab qayta topshirishingiz mumkin.`
              : "30 kundan so'ng qayta topshirishingiz mumkin."}
          </p>
        </Card>
      );
    }

    default:
      return (
        <Card>
          <p className="text-[14px] text-ink-soft">
            Ro&apos;yxatdan o&apos;tishni yakunlang.
          </p>
          <PillButton className="mt-4" onClick={() => router.push("/register")}>
            Davom etish
          </PillButton>
        </Card>
      );
  }
}

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<TalentSnapshot | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    initTelegramUi();
    if (!isInsideTelegram()) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    apiFetch<{ snapshot: TalentSnapshot }>("/api/me")
      .then(({ snapshot: fresh }) => {
        if (cancelled) return;
        if (fresh.status === "yangi") {
          router.replace("/register");
          return;
        }
        setSnapshot(fresh);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (failed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-center text-[14px] text-ink-soft">
          Profilni yuklab bo&apos;lmadi. Ilovani yopib, qayta oching.
        </p>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="px-5 pt-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3.5 w-1/3" />
          </div>
        </div>
        <Skeleton className="mt-6 h-64 w-full rounded-card" />
        <Skeleton className="mt-4 h-40 w-full rounded-card" />
      </main>
    );
  }

  const initial = (snapshot.fullName ?? "T").trim().charAt(0).toUpperCase();
  const subtitleParts = [
    snapshot.direction ? DIRECTION_LABELS_UZ[snapshot.direction] : null,
    snapshot.city,
  ].filter(Boolean);

  return (
    <main className="px-5 pb-10 pt-8">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange text-[20px] font-bold text-white shadow-soft">
          {initial}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[19px] font-bold">
            {snapshot.fullName ?? "Talant"}
          </h1>
          <p className="text-[13px] text-ink-soft">
            {subtitleParts.join(" · ")}
          </p>
        </div>
        {snapshot.status === "tekshirilgan" && <Seal size={28} />}
      </div>

      <div className="mt-6">
        <ActionCard snapshot={snapshot} />
      </div>

      <div className="mt-4">
        <Timeline
          status={snapshot.status}
          paymentEnabled={snapshot.paymentEnabled}
        />
      </div>

      <div className="mt-4">
        <ProfileDetails snapshot={snapshot} />
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): JSX.Element | null {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="label-caps shrink-0 pt-0.5">{label}</span>
      <span className="min-w-0 break-words text-right text-[14px] font-medium">
        {value}
      </span>
    </div>
  );
}

function ProfileDetails({
  snapshot,
}: {
  snapshot: TalentSnapshot;
}): JSX.Element {
  return (
    <Card>
      <h2 className="text-[15px] font-bold">Ma&apos;lumotlaringiz</h2>
      <div className="mt-3">
        <DetailRow label="Ism" value={snapshot.fullName} />
        <DetailRow
          label="Tug'ilgan yil"
          value={snapshot.birthYear ? String(snapshot.birthYear) : null}
        />
        <DetailRow label="Shahar" value={snapshot.city} />
        <DetailRow
          label="Yo'nalish"
          value={
            snapshot.direction ? DIRECTION_LABELS_UZ[snapshot.direction] : null
          }
        />
        <DetailRow label="Ta'lim" value={snapshot.education} />
        <DetailRow label="Telefon" value={snapshot.phone} />
        <DetailRow label="Portfolio" value={snapshot.portfolioUrl} />
      </div>
      {snapshot.freeText && (
        <div className="mt-4">
          <p className="label-caps">Siz haqingizda</p>
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">
            {snapshot.freeText}
          </p>
        </div>
      )}
    </Card>
  );
}
