"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import styles from "./chat.module.css";

const CHATS = [
  { id: "1", name: "Kamola O.", last: "Rahmat, suhbatga tayyorman.", time: "12:40", unread: true },
  { id: "2", name: "Jasur T.", last: "Portfolio havolasini yubordim.", time: "Kecha", unread: false },
];

export default function ChatPage(): JSX.Element {
  const router = useRouter();
  useEffect(() => {
    initTelegram();
  }, []);

  if (CHATS.length === 0) {
    return (
      <main className="screen">
        <h1 className={styles.h}>Chat</h1>
        <EmptyState
          icon={<Icon name="chat" size={24} />}
          title="Hozircha suhbat yo'q"
          text="Nomzod so'ralgach, chat shu yerda ochiladi."
        />
      </main>
    );
  }

  return (
    <main className="screen">
      <h1 className={styles.h}>Chat</h1>
      <div className={styles.list}>
        {CHATS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.item}
            onClick={() => {
              haptic("light");
              router.push(`/suhbat/${c.id}`);
            }}
          >
            <Avatar name={c.name} size={48} />
            <div className={styles.texts}>
              <span className={styles.name}>{c.name}</span>
              <span className={styles.last}>{c.last}</span>
            </div>
            <div className={styles.meta}>
              <span className={styles.time}>{c.time}</span>
              {c.unread ? <span className={styles.dot} /> : null}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
