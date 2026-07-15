"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./welcome.module.css";

export default function WelcomePage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    initTelegram({ header: "accent" });
  }, []);

  return (
    <main className={styles.wrap}>
      <div className={styles.hero}>
        <img
          src="/assets/brand/talantly-mark.svg"
          alt=""
          className={styles.mark}
          aria-hidden="true"
        />
      </div>

      <div className={styles.body}>
        <h1 className={styles.title}>
          Ishga mos talant,
          <br />
          talantga mos ish
        </h1>
        <p className={styles.sub}>
          Tekshirilgan profillar va ishonchli ish beruvchilar bir joyda.
        </p>

        <button
          type="button"
          className={styles.cta}
          onClick={() => {
            haptic("light");
            router.push("/rol");
          }}
        >
          Boshlash
          <Icon name="arrow" size={20} />
        </button>
      </div>
    </main>
  );
}
