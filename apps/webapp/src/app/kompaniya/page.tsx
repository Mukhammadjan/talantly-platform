"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Icon } from "@/lib/icons";
import { initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./kompaniya.module.css";

const COMPANY = {
  name: "Novatech",
  kind: "IT kompaniya",
  city: "Toshkent",
  about:
    "Mahsulot jamoasi — veb va mobil yechimlar. Yosh, tashabbuskor mutaxassislarni izlaymiz.",
  needed: ["Dasturlash", "Dizayn", "Marketing"],
};

export default function KompaniyaPage(): JSX.Element {
  const router = useRouter();
  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.back());

  return (
    <main className="screen">
      <div className={styles.head}>
        <span className={styles.logo}>{COMPANY.name.charAt(0)}</span>
        <div className={styles.htexts}>
          <h1 className={styles.name}>{COMPANY.name}</h1>
          <p className={styles.sub}>
            {COMPANY.kind} · {COMPANY.city}
          </p>
        </div>
      </div>

      <Card className={styles.card}>
        <p className={styles.kicker}>Haqida</p>
        <p className={styles.about}>{COMPANY.about}</p>
      </Card>

      <Card className={styles.card}>
        <p className={styles.kicker}>Kerakli yo&apos;nalishlar</p>
        <div className={styles.tags}>
          {COMPANY.needed.map((n) => (
            <span key={n} className={styles.tag}>
              {n}
            </span>
          ))}
        </div>
      </Card>

      <div className={styles.actions}>
        <Button variant="secondary" full icon={<Icon name="edit" size={20} />}>
          Profilni tahrirlash
        </Button>
      </div>
    </main>
  );
}
