"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Sheet } from "@/components/Sheet";
import { Icon } from "@/lib/icons";
import { formatSalary } from "@/lib/labels";
import { SENT_VACANCIES } from "@/mock/data";
import { haptic, initTelegram } from "@/lib/telegram";
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

// Demo mock — backend keyingi bosqichда. Har qator mavjud nomzod detaliga bog'langan.
interface AppRow {
  cid: string;
  name: string;
  role: string;
  district: string;
  salary: number;
  date: string;
  verified: boolean;
}
const ARIZALAR: AppRow[] = [
  { cid: "c1", name: "Abdusattor Mirpulatov", role: "UI/UX dizayner", district: "Toshkent", salary: 12000000, date: "12.12.2022", verified: false },
  { cid: "c2", name: "Shoxrux Shavqiev", role: "UI/UX dizayner", district: "Toshkent", salary: 12000000, date: "12.12.2022", verified: true },
  { cid: "c3", name: "Zafar Olimov", role: "UI/UX dizayner", district: "Toshkent", salary: 12000000, date: "12.12.2022", verified: true },
  { cid: "c1", name: "Shohruh Baxtiyorov", role: "UI/UX dizayner", district: "Toshkent", salary: 7000000, date: "12.12.2022", verified: false },
];

type IState = "pending" | "agreed" | "negotiate" | "sent" | "declined";
interface IntRow {
  cid: string;
  name: string;
  role: string;
  at: string;
  state: IState;
}
const SUHBATLAR: IntRow[] = [
  { cid: "c1", name: "Abdusattor Mirpulatov", role: "UI/UX dizayner", at: "23.02.2023 · 14:00", state: "pending" },
  { cid: "c2", name: "Elzodxon Sharofiddinov", role: "Full Stack dasturchi", at: "23.02.2023 · 14:00", state: "agreed" },
  { cid: "c3", name: "Jasurbek Narzullaev", role: "UI/UX dizayner", at: "23.02.2023 · 14:00", state: "negotiate" },
  { cid: "c1", name: "Bobur Turobov", role: "Front End dasturchi", at: "23.02.2023 · 14:00", state: "sent" },
  { cid: "c2", name: "Ruslan Ubaydullayev", role: "Front End dasturchi", at: "23.02.2023 · 14:00", state: "declined" },
];

// Saqlangan nomzodlar — reference'dagi boy karta uchun.
const SAVED = [
  { cid: "c1", name: "Abdusattor Mirpulatov", role: "UI/UX dizayner", city: "Toshkent", salary: 12000000, age: 37, exp: 5 },
  { cid: "c2", name: "Shoxrux Shavqiev", role: "UI/UX dizayner", city: "Toshkent", salary: 12000000, age: 37, exp: 5 },
  { cid: "c3", name: "Zafar Olimov", role: "UI/UX dizayner", city: "Toshkent", salary: 12000000, age: 37, exp: 5 },
  { cid: "c1", name: "Xusniddin Usmanov", role: "UI/UX dizayner", city: "Toshkent", salary: 12000000, age: 37, exp: 5 },
];

export default function DoskaKindPage(): JSX.Element {
  const params = useParams<{ kind: string }>();
  const router = useRouter();
  const [decided, setDecided] = useState<Record<string, "accepted" | "declined">>({});
  const [unsaved, setUnsaved] = useState<Record<string, boolean>>({});
  const [acked, setAcked] = useState<Record<string, boolean>>({});
  const [timeFor, setTimeFor] = useState<string | null>(null);
  const [chosenTime, setChosenTime] = useState<Record<string, string>>({});
  const [slot, setSlot] = useState("18-iyul · 10:00");

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/izlovchi/doskam"));

  const kind = (
    KINDS.includes(params.kind as Kind) ? params.kind : "arizalar"
  ) as Kind;

  const open = (cid: string): void => {
    haptic("light");
    router.push(`/nomzod/${cid}`);
  };
  const decide = (key: string, v: "accepted" | "declined"): void => {
    haptic(v === "accepted" ? "success" : "light");
    setDecided((d) => ({ ...d, [key]: v }));
  };

  return (
    <main className="screen">
      <h1 className={styles.h}>{TITLES[kind]}</h1>

      {/* SAQLANGAN NOMZODLAR */}
      {kind === "saqlangan" && (
        <div className={styles.list}>
          {SAVED.map((r, i) => {
            const key = `sv${i}`;
            const off = unsaved[key];
            return (
              <button key={key} type="button" className={styles.card} onClick={() => open(r.cid)}>
                <span className={styles.head}>
                  <Avatar name={r.name} size={44} />
                  <span className={styles.htext}>
                    <span className={styles.hname}>{r.name}</span>
                    <span className={styles.hrole}>{r.role}</span>
                  </span>
                  <span
                    className={`${styles.bookmark} ${off ? styles.bookmarkOff : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic("light");
                      setUnsaved((u) => ({ ...u, [key]: !u[key] }));
                    }}
                  >
                    <Icon name="bookmark" size={18} filled={!off} />
                  </span>
                </span>
                <span className={styles.salary}>{formatSalary(r.salary)}dan</span>
                <span className={styles.loc}>{r.city} shahri</span>
                <div className={styles.stat}>
                  <span className={styles.statItem}>
                    Yosh: <b>{r.age}</b>
                  </span>
                  <span className={styles.statItem}>
                    Tajriba: <b>{r.exp} yil</b>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* KELGAN ARIZALAR */}
      {kind === "arizalar" && (
        <div className={styles.list}>
          {ARIZALAR.map((r, i) => {
            const key = `a${i}`;
            const d = decided[key];
            return (
              <article key={key} className={styles.card}>
                <button type="button" className={styles.head} onClick={() => open(r.cid)}>
                  <Avatar name={r.name} size={44} />
                  <span className={styles.htext}>
                    <span className={styles.hname}>{r.name}</span>
                    <span className={styles.hrole}>{r.role}</span>
                  </span>
                </button>

                <div className={styles.money}>
                  <span className={styles.salary}>{formatSalary(r.salary)}dan</span>
                  <span className={styles.right}>
                    {r.verified && (
                      <span className={styles.globe}>
                        <Icon name="check" size={13} />
                      </span>
                    )}
                    <span className={styles.date}>{r.date}</span>
                  </span>
                </div>
                <span className={styles.loc}>{r.district} shahri</span>

                {d ? (
                  <div className={`${styles.banner} ${d === "accepted" ? styles.bGreen : styles.bGray}`}>
                    <span>{d === "accepted" ? "Qabul qilindi" : "Rad etildi"}</span>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <button type="button" className={`${styles.btn} ${styles.reject}`} onClick={() => decide(key, "declined")}>
                      Rad etish
                    </button>
                    <button type="button" className={`${styles.btn} ${styles.accept}`} onClick={() => decide(key, "accepted")}>
                      Qabul qilish
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* SUHBATLAR */}
      {kind === "suhbatlar" && (
        <div className={styles.list}>
          {SUHBATLAR.map((r, i) => {
            const key = `s${i}`;
            const d = decided[key];
            const state = d ? (d === "accepted" ? "done" : "declined") : r.state;
            return (
              <article key={key} className={styles.card}>
                <button type="button" className={styles.head} onClick={() => open(r.cid)}>
                  <Avatar name={r.name} size={44} />
                  <span className={styles.htext}>
                    <span className={styles.hname}>{r.name}</span>
                    <span className={styles.hrole}>{r.role}</span>
                  </span>
                </button>

                <span className={styles.when}>
                  <Icon name="calendar" size={16} />
                  {r.at}
                </span>

                {state === "pending" && (
                  <div className={styles.actions}>
                    <button type="button" className={`${styles.btn} ${styles.reject}`} onClick={() => decide(key, "declined")}>
                      Rad etish
                    </button>
                    <button type="button" className={`${styles.btn} ${styles.accept}`} onClick={() => decide(key, "accepted")}>
                      Qabul qilish
                    </button>
                  </div>
                )}
                {state === "done" && (
                  <div className={`${styles.banner} ${styles.bGreen}`}>
                    <span>Suhbat qabul qilindi</span>
                  </div>
                )}
                {state === "agreed" && (
                  <div className={`${styles.banner} ${styles.bGreen}`}>
                    <span>Nomzod ushbu suhbatga rozi bo&apos;ldi</span>
                    {!acked[key] && (
                      <button
                        type="button"
                        className={`${styles.bbtn} ${styles.bbtnGreen}`}
                        onClick={() => {
                          haptic("light");
                          setAcked((a) => ({ ...a, [key]: true }));
                        }}
                      >
                        Yaxshi
                      </button>
                    )}
                  </div>
                )}
                {state === "negotiate" &&
                  (chosenTime[key] ? (
                    <div className={`${styles.banner} ${styles.bGreen}`}>
                      <span>Vaqt belgilandi · {chosenTime[key]}</span>
                    </div>
                  ) : (
                    <div className={`${styles.banner} ${styles.bGreen}`}>
                      <span>Vaqtni kelishish</span>
                      <button
                        type="button"
                        className={`${styles.bbtn} ${styles.bbtnGreen}`}
                        onClick={() => {
                          haptic("light");
                          setSlot("18-iyul · 10:00");
                          setTimeFor(key);
                        }}
                      >
                        Vaqt belgilash
                      </button>
                    </div>
                  ))}
                {state === "sent" && (
                  <div className={`${styles.banner} ${styles.bGray}`}>
                    <span>Suhbat taklifi yuborildi</span>
                  </div>
                )}
                {state === "declined" && (
                  <div className={`${styles.banner} ${styles.bRed}`}>
                    <span>Siz ushbu suhbatga rozi bo&apos;lmadingiz</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* YUBORILGAN TAKLIFLAR — vakansiya bo'yicha guruhlangan */}
      {kind === "takliflar" && (
        <div className={styles.list}>
          {SENT_VACANCIES.map((v) => (
            <button
              key={v.id}
              type="button"
              className={styles.card}
              onClick={() => {
                haptic("light");
                router.push(`/taklif/${v.id}`);
              }}
            >
              <span className={styles.head}>
                <Avatar name={v.company} size={40} />
                <span className={styles.htext}>
                  <span className={styles.company}>{v.company}</span>
                  <span className={styles.vtitle}>{v.title}</span>
                </span>
              </span>
              <span className={styles.salary}>{formatSalary(v.salaryFrom)}dan</span>
              <span className={styles.loc}>
                {v.date} · {v.district}
              </span>
              <div className={styles.sentBox}>
                Yuborilgan: <b>{v.candidates.length} nomzodga</b>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bo'sh holat himoyasi */}
      {kind === "arizalar" && ARIZALAR.length === 0 && (
        <EmptyState icon={<Icon name="doc" size={24} />} title="Hozircha ariza yo'q" />
      )}

      <Sheet
        open={timeFor !== null}
        onClose={() => setTimeFor(null)}
        title="Suhbat vaqtini belgilang"
      >
        <div className={styles.slots}>
          {["17-iyul · 14:00", "18-iyul · 10:00", "18-iyul · 16:00", "19-iyul · 11:00"].map(
            (s) => (
              <Chip key={s} label={s} active={slot === s} onClick={() => setSlot(s)} />
            ),
          )}
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.accept} ${styles.wide}`}
          onClick={() => {
            haptic("success");
            if (timeFor) setChosenTime((t) => ({ ...t, [timeFor]: slot }));
            setTimeFor(null);
          }}
        >
          Tasdiqlash
        </button>
      </Sheet>
    </main>
  );
}
