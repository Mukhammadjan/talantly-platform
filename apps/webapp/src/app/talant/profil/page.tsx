"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Sheet } from "@/components/Sheet";
import { Skeleton } from "@/components/Skeleton";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import {
  DIRECTION_LABELS,
  LEVEL_LABELS,
  WORK_FORMAT_LABELS,
  formatSalary,
} from "@/lib/labels";
import { initTelegram } from "@/lib/telegram";
import type { TalentSnapshot } from "@/lib/types";
import styles from "./profil.module.css";

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): JSX.Element | null {
  if (!value) return null;
  return (
    <div className={styles.row}>
      <span className={styles.rlabel}>{label}</span>
      <span className={styles.rvalue}>{value}</span>
    </div>
  );
}

export default function ProfilPage(): JSX.Element {
  const router = useRouter();
  const [snap, setSnap] = useState<TalentSnapshot | null>(null);
  const [hidden, setHidden] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [complaintSent, setComplaintSent] = useState(false);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getTalent().then((s) => {
      if (!live) return;
      setSnap(s);
      setHidden(Boolean(s.isHidden));
    });
    return () => {
      live = false;
    };
  }, []);

  if (!snap) {
    return (
      <main className="screen">
        <Skeleton height={64} width={64} radius={999} />
        <Skeleton height={220} radius={18} className={styles.sk} />
      </main>
    );
  }

  const p = snap.profile;
  const verified = snap.status === "tekshirilgan";

  return (
    <main className="screen">
      <button
        type="button"
        className={styles.settings}
        onClick={() => router.push("/sozlamalar")}
        aria-label="Sozlamalar"
      >
        <Icon name="settings" size={22} />
      </button>

      <div className={styles.head}>
        <Avatar name={p.fullName} photoUrl={p.photoUrl} size={64} />
        <div className={styles.htexts}>
          <h1 className={styles.name}>{p.fullName}</h1>
          <p className={styles.sub}>
            {[
              p.direction ? DIRECTION_LABELS[p.direction] : null,
              p.level ? LEVEL_LABELS[p.level] : null,
              p.city,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        {verified ? (
          <Badge variant="verified" icon={<Icon name="check" size={14} />}>
            Tekshirilgan
          </Badge>
        ) : null}
      </div>

      {p.about ? <p className={styles.about}>&quot;{p.about}&quot;</p> : null}

      <Card className={styles.card}>
        <Row label="Shahar" value={p.city} />
        <Row label="Tuman" value={p.district} />
        <Row
          label="Yo'nalish"
          value={p.direction ? DIRECTION_LABELS[p.direction] : null}
        />
        <Row label="Daraja" value={p.level ? LEVEL_LABELS[p.level] : null} />
        <Row
          label="Ish formati"
          value={
            p.workFormats.length
              ? p.workFormats.map((f) => WORK_FORMAT_LABELS[f]).join(", ")
              : null
          }
        />
        <Row label="Kutilayotgan maosh" value={formatSalary(p.salaryFrom)} />
      </Card>

      {p.skills.length ? (
        <Card className={styles.card}>
          <p className={styles.kicker}>Ko&apos;nikmalar</p>
          <div className={styles.skills}>
            {p.skills.map((s) => (
              <span key={s} className={styles.skill}>
                {s}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      <div className={styles.actions}>
        {snap.cvReady ? (
          <Button
            full
            icon={<Icon name="doc" size={20} />}
            onClick={() => router.push("/cv")}
          >
            CV&apos;ni ko&apos;rish
          </Button>
        ) : null}
        <Button
          variant="secondary"
          full
          icon={<Icon name="edit" size={20} />}
          onClick={() => router.push("/profil-forma")}
        >
          Profilni tahrirlash
        </Button>
      </div>

      {verified || snap.status === "band" ? (
        <Card className={styles.visCard}>
          <span className={styles.visTexts}>
            <span className={styles.visTitle}>Profil ko&apos;rinishi</span>
            <span className={styles.visText}>
              {hidden
                ? "Yashirin — kompaniyalar sizni ko'rmaydi"
                : "Faol — kompaniyalarga ko'rinasiz"}
            </span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={!hidden}
            aria-label="Profil ko'rinishi"
            className={`${styles.visToggle} ${hidden ? "" : styles.visOn}`}
            onClick={() => {
              const next = !hidden;
              setHidden(next);
              void api.saveTalentProfile({ isHidden: next });
            }}
          >
            <span className={styles.visKnob} />
          </button>
        </Card>
      ) : null}

      <button
        type="button"
        className={styles.complaintBtn}
        onClick={() => setComplaintOpen(true)}
      >
        <Icon name="info" size={16} />
        Shikoyat yuborish
      </button>

      <Sheet
        open={complaintOpen}
        onClose={() => setComplaintOpen(false)}
        title="Shikoyat yuborish"
      >
        {complaintSent ? (
          <p className={styles.complaintOk}>
            ✓ Shikoyatingiz qabul qilindi — administrator ko&apos;rib chiqadi.
          </p>
        ) : (
          <>
            <textarea
              className={styles.complaintArea}
              rows={4}
              maxLength={500}
              placeholder="Muammoni qisqacha yozing..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
            />
            <Button
              full
              disabled={complaintText.trim().length < 3}
              onClick={() => {
                void api
                  .sendComplaint(complaintText.trim().slice(0, 140), complaintText.trim())
                  .then(() => setComplaintSent(true));
              }}
            >
              Yuborish
            </Button>
          </>
        )}
      </Sheet>
    </main>
  );
}
