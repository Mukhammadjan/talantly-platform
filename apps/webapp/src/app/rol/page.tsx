"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./rol.module.css";

export default function RolPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Auth/onboarding ekrani — orange hero.
    initTelegram({ header: "accent" });
  }, []);

  const go = (path: string): void => {
    haptic("light");
    router.push(path);
  };

  return (
    <main className={styles.wrap}>
      <div className={styles.hero}>
        <img
          src="/assets/brand/talantly-wordmark-light.svg"
          alt="Talantly"
          className={styles.logo}
        />
        <h1 className={styles.title}>Xush kelibsiz</h1>
        <p className={styles.sub}>Talantly&apos;da kim sifatida davom etasiz?</p>
      </div>

      <div className={styles.cards}>
        <button
          type="button"
          className={styles.role}
          onClick={() => go("/talant")}
        >
          <span className={styles.emoji} aria-hidden="true">
            🎓
          </span>
          <span className={styles.texts}>
            <span className={styles.rtitle}>Men talantman</span>
            <span className={styles.rtext}>
              Tekshiruvdan o&apos;tib, tasdiqlangan profil oling
            </span>
          </span>
          <Icon name="chevron" size={20} className={styles.chev} />
        </button>

        <button
          type="button"
          className={styles.role}
          onClick={() => go("/izlovchi")}
        >
          <span className={styles.emoji} aria-hidden="true">
            🔍
          </span>
          <span className={styles.texts}>
            <span className={styles.rtitle}>Ish beruvchiman</span>
            <span className={styles.rtext}>
              Tekshirilgan nomzodlarni toping va bog&apos;laning
            </span>
          </span>
          <Icon name="chevron" size={20} className={styles.chev} />
        </button>
      </div>

      <p className={styles.foot}>
        Rolni keyinchalik istalgan vaqtda almashtirishingiz mumkin.
      </p>
    </main>
  );
}
