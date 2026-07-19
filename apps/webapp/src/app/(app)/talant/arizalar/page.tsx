"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { DIRECTION_LABELS, REQUEST_STATUS_LABELS } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import type { Application, RequestStatus } from "@/lib/types";
import styles from "./arizalar.module.css";

const VARIANT: Record<
  RequestStatus,
  "neutral" | "action" | "verified"
> = {
  yuborildi: "neutral",
  korildi: "action",
  boglanildi: "verified",
  yopildi: "neutral",
};

export default function ArizalarPage(): JSX.Element {
  const router = useRouter();
  const [apps, setApps] = useState<Application[] | null>(null);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getApplications().then((a) => {
      if (live) setApps(a);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <main className="screen">
      <h1 className={styles.h}>Arizalarim</h1>
      {!apps ? (
        <>
          <Skeleton height={72} radius={18} className={styles.sk} />
          <Skeleton height={72} radius={18} className={styles.sk} />
        </>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={<Icon name="briefcase" size={24} />}
          title="Hozircha ariza yo'q"
          text="Tekshiruvdan o'tgach, kompaniyalar sizni ko'radi."
        />
      ) : (
        <div className={styles.list}>
          {apps.map((a) => (
            <Card
              key={a.id}
              className={styles.item}
              onClick={() => {
                haptic("light");
                router.push(`/ariza/${a.id}`);
              }}
            >
              <div className={styles.top}>
                <span className={styles.company}>{a.company}</span>
                <Badge variant={VARIANT[a.status]}>
                  {REQUEST_STATUS_LABELS[a.status]}
                </Badge>
              </div>
              <span className={styles.meta}>
                {DIRECTION_LABELS[a.direction]} · {a.at}
              </span>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
