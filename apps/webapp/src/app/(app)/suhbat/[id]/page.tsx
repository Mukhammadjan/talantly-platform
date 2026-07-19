"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./suhbat.module.css";

interface Msg {
  id: number;
  me: boolean;
  text: string;
  time: string;
}

// Demo suhbatlar — backend keyingi bosqichда.
const CONTACTS: Record<string, { name: string; thread: Msg[] }> = {
  "1": {
    name: "Kamola O.",
    thread: [
      { id: 1, me: false, text: "Assalomu alaykum! Vakansiyangiz bilan qiziqdim.", time: "12:30" },
      { id: 2, me: true, text: "Vaalaykum assalom! Portfoliongizni ko'rdik, zo'r.", time: "12:34" },
      { id: 3, me: false, text: "Rahmat! Suhbatga tayyorman.", time: "12:40" },
    ],
  },
  "2": {
    name: "Jasur T.",
    thread: [
      { id: 1, me: false, text: "Portfolio havolasini yubordim.", time: "Kecha" },
      { id: 2, me: true, text: "Qabul qilindi, ko'rib chiqamiz.", time: "Kecha" },
    ],
  },
};

export default function SuhbatPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const contact = CONTACTS[params.id] ?? { name: "Nomzod", thread: [] };
  const [msgs, setMsgs] = useState<Msg[]>(contact.thread);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/izlovchi/chat"));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const send = (): void => {
    const t = draft.trim();
    if (!t) return;
    haptic("light");
    setMsgs((m) => [...m, { id: m.length + 1, me: true, text: t, time: "hozir" }]);
    setDraft("");
  };

  return (
    <main className={styles.wrap}>
      <header className={styles.top}>
        <Avatar name={contact.name} size={40} />
        <span className={styles.htext}>
          <span className={styles.name}>{contact.name}</span>
          <span className={styles.online}>Onlayn</span>
        </span>
      </header>

      <div className={styles.thread}>
        {msgs.map((m) => (
          <div key={m.id} className={`${styles.row} ${m.me ? styles.rowMe : ""}`}>
            <div className={`${styles.bubble} ${m.me ? styles.me : styles.them}`}>
              <span className={styles.msgText}>{m.text}</span>
              <span className={styles.time}>
                {m.time}
                {m.me ? <Icon name="check" size={12} /> : null}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className={styles.composer}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Xabar yozing"
          aria-label="Xabar"
        />
        <button
          type="button"
          className={styles.send}
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Yuborish"
        >
          <Icon name="send" size={20} />
        </button>
      </div>
    </main>
  );
}
