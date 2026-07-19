"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { DIRECTION_LABELS, REQUEST_STATUS_LABELS } from "@/lib/labels";
import { APPLICATIONS } from "@/mock/data";
import { initTelegram } from "@/lib/telegram";
import type { RequestStatus } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./ariza.module.css";

const FLOW: { key: RequestStatus; label: string; text: string }[] = [
  { key: "yuborildi", label: "So'rov yuborildi", text: "Kompaniya profilingizni so'radi." },
  { key: "korildi", label: "Profil ko'rildi", text: "Kompaniya ma'lumotlaringizni ko'rib chiqdi." },
  { key: "boglanildi", label: "Bog'lanildi", text: "Kompaniya siz bilan bog'landi." },
];

const RANK: Record<RequestStatus, number> = {
  yuborildi: 0,
  korildi: 1,
  boglanildi: 2,
  yopildi: 3,
};

const VARIANT: Record<RequestStatus, "neutral" | "action" | "verified"> = {
  yuborildi: "neutral",
  korildi: "action",
  boglanildi: "verified",
  yopildi: "neutral",
};

export default function ArizaDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/talant/arizalar"));

  const a = APPLICATIONS.find((x) => x.id === params.id);
  if (!a) {
    return (
      <main className="screen">
        <EmptyState icon={<Icon name="briefcase" size={24} />} title="Ariza topilmadi" />
      </main>
    );
  }

  const current = RANK[a.status];

  return (
    <main className="screen">
      <div className={styles.head}>
        <span className={styles.logo}>{a.company.charAt(0)}</span>
        <div className={styles.htexts}>
          <h1 className={styles.name}>{a.company}</h1>
          <p className={styles.sub}>
            {DIRECTION_LABELS[a.direction]} · {a.at}
          </p>
        </div>
        <Badge variant={VARIANT[a.status]}>{REQUEST_STATUS_LABELS[a.status]}</Badge>
      </div>

      <Card className={styles.card}>
        <p className={styles.kicker}>Jarayon</p>
        <div className={styles.flow}>
          {FLOW.map((s, i) => {
            const done = i <= current;
            const isCurrent = i === current;
            const last = i === FLOW.length - 1;
            return (
              <div key={s.key} className={styles.row}>
                <span className={styles.dotCol}>
                  <span
                    className={`${styles.dot} ${done ? styles.dotDone : ""} ${
                      isCurrent ? styles.dotCurrent : ""
                    }`}
                  >
                    {done ? <Icon name="check" size={13} /> : null}
                  </span>
                  {!last ? (
                    <span className={`${styles.conn} ${i < current ? styles.connDone : ""}`} />
                  ) : null}
                </span>
                <span className={styles.texts}>
                  <span className={`${styles.stepLabel} ${done ? styles.labelDone : ""}`}>
                    {s.label}
                  </span>
                  <span className={styles.stepText}>{s.text}</span>
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className={styles.note}>
        <span className={styles.noteIcon}>
          <Icon name="info" size={18} />
        </span>
        <span>
          {a.status === "boglanildi"
            ? "Kompaniya siz bilan bog'landi. Javobni kutmoqda."
            : "Kompaniya siz bilan tez orada bog'lanadi."}
        </span>
      </div>
    </main>
  );
}
