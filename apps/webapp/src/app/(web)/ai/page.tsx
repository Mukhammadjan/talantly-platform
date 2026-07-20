"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RegisterSheet } from "@/components/web/RegisterSheet";
import { Icon, type IconName } from "@/lib/icons";
import styles from "./ai.module.css";

interface Tool {
  key: string;
  icon: IconName;
  title: string;
  text: string;
  cta: string;
  action: "register" | "vakansiyalar";
}

const TOOLS: Tool[] = [
  {
    key: "cv",
    icon: "sparkle",
    title: "AI CV",
    text: "Xom ma'lumotlaringizdan professional CV. AI siz aytolmagan ko'nikmalaringizni ham topib, ta'kidlaydi.",
    cta: "CV yaratish",
    action: "register",
  },
  {
    key: "match",
    icon: "star",
    title: "AI-Match",
    text: "Har bir vakansiya sizga qanchalik mos kelishini AI foizda hisoblab, sabablarini ko'rsatadi.",
    cta: "Vakansiyalarni ko'rish",
    action: "vakansiyalar",
  },
  {
    key: "shaxsiyat",
    icon: "user",
    title: "Shaxsiyat testi",
    text: "Ish uslubingiz va arxetipingizni aniqlang — ish beruvchilar sizni to'g'ri tushunsin.",
    cta: "Testni boshlash",
    action: "register",
  },
  {
    key: "konikma",
    icon: "check",
    title: "Ko'nikma testi",
    text: "Yo'nalishingiz bo'yicha bilimingizni onlayn tasdiqlang va tekshirilgan ball oling.",
    cta: "Testni topshirish",
    action: "register",
  },
];

export default function AiPage(): JSX.Element {
  const router = useRouter();
  const [registerOpen, setRegisterOpen] = useState(false);

  const onCta = (t: Tool): void => {
    if (t.action === "vakansiyalar") router.push("/vakansiyalar");
    else setRegisterOpen(true);
  };

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <header className={styles.hero}>
          <span className={styles.kicker}>
            <Icon name="sparkle" size={14} /> AI VOSITALAR
          </span>
          <h1 className={styles.title}>
            Iqtidoringizni AI kuchi bilan ko&apos;rsating
          </h1>
          <p className={styles.sub}>
            Talantly sizning kuchli tomonlaringizni topadi, tekshiradi va
            ish beruvchilarga ishonchli tarzda taqdim etadi.
          </p>
        </header>

        <div className={styles.grid}>
          {TOOLS.map((t) => (
            <article key={t.key} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                <Icon name={t.icon} size={22} />
              </span>
              <h2 className={styles.cardTitle}>{t.title}</h2>
              <p className={styles.cardText}>{t.text}</p>
              <button
                type="button"
                className={styles.cardCta}
                onClick={() => onCta(t)}
              >
                {t.cta} →
              </button>
            </article>
          ))}
        </div>

        <section className={styles.banner}>
          <div>
            <h2 className={styles.bannerTitle}>
              Tekshirilgan profil = ishonch
            </h2>
            <p className={styles.bannerText}>
              4 bosqichli tekshiruvdan o&apos;ting va yashil
              &laquo;Tekshirilgan&raquo; belgisini qo&apos;lga kiriting.
            </p>
          </div>
          <Link href="/vakansiyalar" className={styles.bannerBtn}>
            Vakansiyalarni ko&apos;rish
          </Link>
        </section>
      </div>

      <RegisterSheet
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="AI vositalardan foydalanish uchun ro'yxatdan o'ting"
      />
    </main>
  );
}
