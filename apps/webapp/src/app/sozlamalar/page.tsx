"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/Sheet";
import { Icon, type IconName } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./sozlamalar.module.css";

const LANGS = [
  { code: "uz", label: "O'zbekcha" },
  { code: "ru", label: "Ruscha" },
];

export default function SozlamalarPage(): JSX.Element {
  const router = useRouter();
  const [lang, setLang] = useState("uz");
  const [notify, setNotify] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.back());

  const langLabel = LANGS.find((l) => l.code === lang)?.label ?? "O'zbekcha";

  return (
    <main className="screen">
      <h1 className={styles.h}>Sozlamalar</h1>

      <div className={styles.group}>
        <Row icon="user" label="Umumiy ma'lumot" onClick={() => router.push("/profil-forma")} />
        <Row
          icon="globe"
          label="Til"
          value={langLabel}
          onClick={() => {
            haptic("light");
            setLangOpen(true);
          }}
        />
        <div className={styles.row}>
          <span className={styles.ricon}>
            <Icon name="bell" size={20} />
          </span>
          <span className={styles.rlabel}>Bildirishnomalar</span>
          <button
            type="button"
            className={`${styles.toggle} ${notify ? styles.toggleOn : ""}`}
            role="switch"
            aria-checked={notify}
            aria-label="Bildirishnomalar"
            onClick={() => {
              haptic("light");
              setNotify((v) => !v);
            }}
          >
            <span className={styles.knob} />
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <Row icon="swap" label="Rolni almashtirish" onClick={() => router.push("/rol")} />
        <Row
          icon="logout"
          label="Chiqish"
          danger
          onClick={() => {
            haptic("light");
            setLogoutOpen(true);
          }}
        />
      </div>

      <p className={styles.version}>talantly · v2.0</p>

      <Sheet open={langOpen} onClose={() => setLangOpen(false)} title="Tilni tanlang">
        <div className={styles.langList}>
          {LANGS.map((l) => {
            const on = lang === l.code;
            return (
              <button
                key={l.code}
                type="button"
                className={`${styles.langRow} ${on ? styles.langOn : ""}`}
                onClick={() => {
                  haptic("light");
                  setLang(l.code);
                  setLangOpen(false);
                }}
              >
                <span className={styles.langLabel}>{l.label}</span>
                {on ? <Icon name="check" size={18} className={styles.langCheck} /> : null}
              </button>
            );
          })}
        </div>
      </Sheet>

      <Sheet open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Chiqish">
        <p className={styles.logoutText}>Hisobingizdan chiqmoqchimisiz?</p>
        <div className={styles.logoutActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => setLogoutOpen(false)}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={() => {
              haptic("success");
              router.push("/welcome");
            }}
          >
            Chiqish
          </button>
        </div>
      </Sheet>
    </main>
  );
}

function Row({
  icon,
  label,
  value,
  danger = false,
  onClick,
}: {
  icon: IconName;
  label: string;
  value?: string;
  danger?: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <span className={`${styles.ricon} ${danger ? styles.riconDanger : ""}`}>
        <Icon name={icon} size={20} />
      </span>
      <span className={`${styles.rlabel} ${danger ? styles.rlabelDanger : ""}`}>{label}</span>
      {value ? <span className={styles.rvalue}>{value}</span> : null}
      <Icon name="chevron" size={18} className={styles.chev} />
    </button>
  );
}
