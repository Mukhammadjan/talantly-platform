"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { CandidateCard } from "@/components/CandidateCard";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { DIRECTION_LABELS } from "@/lib/labels";
import { CANDIDATES } from "@/mock/data";
import { haptic, initTelegram } from "@/lib/telegram";
import type { Candidate } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./doska.module.css";

type Kind = "arizalar" | "suhbatlar" | "takliflar" | "saqlangan";
const KINDS: Kind[] = ["arizalar", "suhbatlar", "takliflar", "saqlangan"];
const TITLES: Record<Kind, string> = {
  arizalar: "Kelgan arizalar",
  suhbatlar: "Suhbatlar",
  takliflar: "Yuborilgan takliflar",
  saqlangan: "Saqlangan nomzodlar",
};

// Demo: mavjud nomzodlarни takrorlab ro'yxatni to'ldiramiz (backend keyin).
const POOL: Candidate[] = [...CANDIDATES, ...CANDIDATES].slice(0, 5);

function Row({
  c,
  sub,
  right,
  onClick,
}: {
  c: Candidate;
  sub: string;
  right: ReactNode;
  onClick: () => void;
}): JSX.Element {
  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <Avatar name={c.displayName} size={44} />
      <span className={styles.texts}>
        <span className={styles.name}>{c.displayName}</span>
        <span className={styles.sub}>{sub}</span>
      </span>
      {right}
    </button>
  );
}

export default function DoskaKindPage(): JSX.Element {
  const params = useParams<{ kind: string }>();
  const router = useRouter();

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/izlovchi/doskam"));

  const kind = (
    KINDS.includes(params.kind as Kind) ? params.kind : "arizalar"
  ) as Kind;
  const open = (id: string): void => {
    haptic("light");
    router.push(`/nomzod/${id}`);
  };

  const arizaStatus = ["Yangi", "Ko'rildi", "Ko'rildi"];
  const taklifStatus = ["Yuborildi", "Ko'rildi", "Bog'lanildi"];
  const times = ["16-iyul · 10:00", "17-iyul · 14:00", "18-iyul · 13:00"];

  return (
    <main className="screen">
      <h1 className={styles.h}>{TITLES[kind]}</h1>

      {kind === "saqlangan" ? (
        <div className={styles.cards}>
          {POOL.map((c, i) => (
            <CandidateCard key={`${c.id}-${i}`} c={c} />
          ))}
        </div>
      ) : POOL.length === 0 ? (
        <EmptyState icon={<Icon name="doc" size={24} />} title="Bo'sh" />
      ) : (
        <div className={styles.list}>
          {POOL.map((c, i) => {
            let sub: string;
            let right: ReactNode;
            if (kind === "arizalar") {
              sub = `${c.role} · ${c.district}`;
              const st = arizaStatus[i % 3] ?? "Ko'rildi";
              right = (
                <Badge variant={st === "Yangi" ? "action" : "neutral"}>
                  {st}
                </Badge>
              );
            } else if (kind === "suhbatlar") {
              sub = times[i % 3] ?? "";
              right = <Badge variant="action">Belgilangan</Badge>;
            } else {
              sub = DIRECTION_LABELS[c.direction];
              const st = taklifStatus[i % 3] ?? "Yuborildi";
              right = (
                <Badge variant={st === "Bog'lanildi" ? "verified" : "neutral"}>
                  {st}
                </Badge>
              );
            }
            return (
              <Row
                key={`${c.id}-${i}`}
                c={c}
                sub={sub}
                right={right}
                onClick={() => open(c.id)}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
