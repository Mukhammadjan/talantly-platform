"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./yordam.module.css";

const FAQ = [
  {
    q: "talantly qanday ishlaydi?",
    a: "Har bir nomzod 4 bosqichli tekshiruvdan o'tadi: AI rezyume, ko'nikma testi, jonli suhbat va tasdiqlash. Siz faqat tekshirilgan nomzodlarni ko'rasiz.",
  },
  {
    q: "Nomzodni qanday so'rayman?",
    a: "Nomzod profilida «Nomzodni so'rash» tugmasini bosing. To'lovdan so'ng uning aloqa ma'lumotlari va rezyumesi ochiladi.",
  },
  {
    q: "«Tekshirilgan» belgisi nimani anglatadi?",
    a: "Yashil «Tekshirilgan» belgisi — nomzod barcha bosqichlardan o'tgan va uning ko'nikmalari jamoamiz tomonidan tasdiqlangan.",
  },
  {
    q: "Vakansiya qanday yarataman?",
    a: "«Ko'proq» → «Vakansiya yaratish» orqali lavozim, yo'nalish va shartlarni kiriting. Jamoamiz mos nomzodlarni tanlab yuboradi.",
  },
  {
    q: "To'lov qanday amalga oshiriladi?",
    a: "To'lov karta orqali. Chek skrinshotini botga yuborasiz, moderator tasdiqlaydi — MVP bosqichida to'lov API'siz.",
  },
];

export default function YordamPage(): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/izlovchi/koproq"));

  return (
    <main className="screen">
      <h1 className={styles.h}>Yordam</h1>
      <p className={styles.sub}>Ko&apos;p so&apos;raladigan savollar</p>

      <div className={styles.list}>
        {FAQ.map((item, i) => {
          const on = open === i;
          return (
            <div key={item.q} className={`${styles.item} ${on ? styles.itemOn : ""}`}>
              <button
                type="button"
                className={styles.q}
                onClick={() => {
                  haptic("light");
                  setOpen(on ? null : i);
                }}
              >
                <span>{item.q}</span>
                <span className={`${styles.chev} ${on ? styles.chevOn : ""}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
              {on ? <p className={styles.a}>{item.a}</p> : null}
            </div>
          );
        })}
      </div>

      <div className={styles.contact}>
        <span className={styles.cIcon}>
          <Icon name="phone" size={20} />
        </span>
        <div className={styles.cTexts}>
          <span className={styles.cTitle}>Yana savol bormi?</span>
          <span className={styles.cText}>Admin: +998 99 030 73 22</span>
        </div>
      </div>
    </main>
  );
}
