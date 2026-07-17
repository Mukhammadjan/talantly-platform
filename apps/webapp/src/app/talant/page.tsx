"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import type { TalentSnapshot, TalentStatus } from "@/lib/types";
import styles from "./hub.module.css";

interface NextStep {
  title: string;
  text: string;
  cta: string;
  href: string;
}

const NEXT_STEP: Record<TalentStatus, NextStep | null> = {
  yangi: {
    title: "Ma'lumotlaringizni to'ldiring",
    text: "Profilingizni yakunlang — 4 ta qisqa qadam.",
    cta: "Boshlash",
    href: "/profil-forma",
  },
  malumot_toldirilgan: {
    title: "Xarakter testi 🧭",
    text: "15 ta qisqa savol — to'g'ri javob yo'q. Ish uslubingizni ochadi.",
    cta: "Testni boshlash",
    href: "/shaxsiyat",
  },
  tolov_kutilmoqda: {
    title: "To'lov tekshirilmoqda",
    text: "Chekingiz qabul qilindi. 24 soat ichida tasdiqlaymiz.",
    cta: "Holatni ko'rish",
    href: "/talant",
  },
  tolov_tasdiqlangan: {
    title: "AI CV tayyorlanmoqda ✨",
    text: "Sun'iy intellekt professional CV yaratmoqda.",
    cta: "Kutish",
    href: "/talant",
  },
  cv_tayyor: {
    title: "Ko'nikma testi",
    text: "Yo'nalishingiz bo'yicha 10 savollik test.",
    cta: "Testni boshlash",
    href: "/konikma",
  },
  test_otgan: {
    title: "Suhbat vaqtini tanlang",
    text: "Yakuniy bosqich — moderator bilan qisqa onlayn suhbat.",
    cta: "Vaqt tanlash",
    href: "/suhbat",
  },
  suhbat_belgilangan: {
    title: "Suhbat belgilandi",
    text: "Boshlanishidan 1 soat oldin eslatma yuboramiz.",
    cta: "Tafsilotlar",
    href: "/suhbat",
  },
  tekshirilgan: null,
  rad_etilgan: null,
  band: null,
};

const PATH_LABELS = [
  "Ro'yxatdan o'tish",
  "Ma'lumot",
  "To'lov",
  "Test",
  "Suhbat",
  "Tekshirilgan",
];

// Har bir status uchun bosib o'tilgan bosqichlar soni (PATH_LABELS indeksi).
// -1 = rad etilgan (yo'l ko'rsatilmaydi).
const ROADMAP_RANK: Record<TalentStatus, number> = {
  yangi: 0,
  malumot_toldirilgan: 1,
  tolov_kutilmoqda: 1,
  tolov_tasdiqlangan: 2,
  cv_tayyor: 2,
  test_otgan: 3,
  suhbat_belgilangan: 4,
  tekshirilgan: 5,
  rad_etilgan: -1,
  band: 5,
};

export default function TalantHubPage(): JSX.Element {
  const router = useRouter();
  const [snap, setSnap] = useState<TalentSnapshot | null>(null);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getTalent().then((s) => {
      if (live) setSnap(s);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!snap) {
    return (
      <main className="screen">
        <Skeleton height={28} width="55%" />
        <Skeleton height={150} radius={18} className={styles.skcard} />
        <Skeleton height={220} radius={18} className={styles.skcard} />
      </main>
    );
  }

  const next = NEXT_STEP[snap.status];
  const rejected = snap.status === "rad_etilgan";
  const doneIndex = ROADMAP_RANK[snap.status];

  return (
    <main className="screen">
      <p className={styles.hello}>Assalomu alaykum,</p>
      <h1 className={styles.name}>{snap.profile.fullName}</h1>

      {snap.status === "tekshirilgan" ? (
        <Card className={styles.verified}>
          <Icon name="check" size={44} className={styles.seal} />
          <h2 className={styles.vtitle}>Siz tekshirilgan talantsiz!</h2>
          <p className={styles.vtext}>
            Profilingiz ishonchli kompaniyalarga tavsiya qilinadi.
          </p>
        </Card>
      ) : rejected ? (
        <Card className={styles.rejected}>
          <span className={styles.rejIcon}>
            <Icon name="info" size={28} />
          </span>
          <h2 className={styles.rejTitle}>Bu safar tasdiqlanmadi</h2>
          <p className={styles.rejText}>
            {snap.radReason === "test_past"
              ? "Ko'nikma testidan yetarli ball to'planmadi. 24 soatdan so'ng testni qayta topshirishingiz mumkin — sizga ishonamiz!"
              : snap.radReason === "soxta_malumot"
                ? "Profil ma'lumotlarida nomuvofiqlik aniqlandi. Batafsil ma'lumot uchun administrator bilan bog'laning."
                : "Suhbat natijasiga ko'ra profilingiz hozircha tasdiqlanmadi. 30 kundan so'ng bitta qayta suhbat imkoniyati beriladi."}
          </p>
          {snap.radReason !== "soxta_malumot" ? (
            <Button
              variant="secondary"
              full
              onClick={() =>
                router.push(
                  snap.radReason === "test_past" ? "/konikma" : "/talant/testlar",
                )
              }
            >
              {snap.radReason === "test_past"
                ? "Testni qayta topshirish"
                : "Testlarni takrorlash"}
            </Button>
          ) : null}
        </Card>
      ) : next ? (
        <Card className={styles.step}>
          <p className={styles.kicker}>Keyingi qadam</p>
          <h2 className={styles.stitle}>{next.title}</h2>
          <p className={styles.stext}>{next.text}</p>
          <Button full onClick={() => router.push(next.href)}>
            {next.cta}
          </Button>
        </Card>
      ) : null}

      {/* Vakansiyalar — navdan chiqarildi (G24), Asosiy'da karta */}
      <Card
        className={styles.vacCard}
        onClick={() => router.push("/talant/vakansiyalar")}
      >
        <span className={styles.vacIcon}>
          <Icon name="briefcase" size={22} />
        </span>
        <span className={styles.vacTexts}>
          <span className={styles.vacTitle}>Ochiq vakansiyalar</span>
          <span className={styles.vacText}>
            Kompaniyalarning takliflarini ko&apos;ring va ariza bering
          </span>
        </span>
        <Icon name="chevron" size={18} className={styles.vacChev} />
      </Card>

      {rejected ? null : (
      <Card className={styles.path}>
        <p className={styles.kicker}>Tekshiruv yo&apos;li</p>
        <div className={styles.steps}>
          {PATH_LABELS.map((label, i) => {
            const done = i <= doneIndex;
            const current = i === doneIndex + 1;
            const last = i === PATH_LABELS.length - 1;
            return (
              <div key={label} className={styles.row}>
                <span className={styles.dotCol}>
                  <span
                    className={`${styles.dot} ${done ? styles.dotDone : ""} ${
                      current ? styles.dotCurrent : ""
                    }`}
                  >
                    {done ? <Icon name="check" size={14} /> : null}
                  </span>
                  {!last ? (
                    <span
                      className={`${styles.conn} ${done ? styles.connDone : ""}`}
                    />
                  ) : null}
                </span>
                <span
                  className={`${styles.stepLabel} ${
                    done
                      ? styles.labelDone
                      : current
                        ? styles.labelCurrent
                        : ""
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      )}
    </main>
  );
}
