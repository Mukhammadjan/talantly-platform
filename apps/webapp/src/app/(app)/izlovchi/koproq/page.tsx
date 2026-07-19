"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./koproq.module.css";

export default function KoproqPage(): JSX.Element {
  const router = useRouter();
  useEffect(() => {
    initTelegram();
  }, []);

  const go = (href: string): void => {
    haptic("light");
    router.push(href);
  };

  return (
    <main className="screen">
      <h1 className={styles.h}>Ko&apos;proq</h1>
      <p className={styles.sub}>Vakansiyalar boshqaruvi.</p>

      <Button
        full
        icon={<Icon name="plus" size={20} />}
        className={styles.create}
        onClick={() => go("/izlovchi/vakansiya-yangi")}
      >
        Vakansiya yaratish
      </Button>

      <div className={styles.group}>
        <button type="button" className={styles.row} onClick={() => go("/izlovchi/vakansiyalarim")}>
          <span className={styles.ricon}>
            <Icon name="briefcase" size={20} />
          </span>
          <span className={styles.rlabel}>Mening vakansiyalarim</span>
          <Icon name="chevron" size={18} className={styles.chev} />
        </button>
        <button type="button" className={styles.row} onClick={() => go("/xarita")}>
          <span className={styles.ricon}>
            <Icon name="map" size={20} />
          </span>
          <span className={styles.rlabel}>Nomzodlar xaritasi</span>
          <Icon name="chevron" size={18} className={styles.chev} />
        </button>
      </div>
    </main>
  );
}
