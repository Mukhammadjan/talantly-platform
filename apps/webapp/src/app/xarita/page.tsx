"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chip } from "@/components/Chip";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { initTelegram } from "@/lib/telegram";
import type { Zone } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./xarita.module.css";

export default function XaritaPage(): JSX.Element {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[] | null>(null);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getZones().then((z) => {
      if (live) setZones(z);
    });
    return () => {
      live = false;
    };
  }, []);
  useBackButton(() => router.back());

  return (
    <main className="screen">
      <div className={styles.head}>
        <h1 className={styles.h}>Xarita</h1>
        <button
          type="button"
          className={styles.listBtn}
          onClick={() => router.push("/izlovchi")}
        >
          <Icon name="users" size={18} />
          Ro&apos;yxat
        </button>
      </div>

      <div className={styles.map}>
        <span className={styles.me} style={{ left: "48%", top: "44%" }} />
        {zones?.map((z) => (
          <button
            key={z.district}
            type="button"
            className={styles.zone}
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
            onClick={() => router.push("/izlovchi")}
          >
            <span className={styles.count}>{z.count}</span>
            <span className={styles.name}>{z.district}</span>
          </button>
        ))}
        <div className={styles.chip}>
          <Chip label="Taxminiy zona" icon={<Icon name="info" size={14} />} />
        </div>
      </div>

      <p className={styles.note}>
        Nuqtalar taxminiy zonalarni ko&apos;rsatadi — aniq manzil maxfiy.
      </p>
    </main>
  );
}
