"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RegisterSheet } from "@/components/web/RegisterSheet";
import { hasSession } from "@/lib/auth";
import {
  type CandidateContact,
  type CandidateView,
  fetchCandidate,
  fetchCandidateAuthed,
  unlockContact,
} from "@/lib/candidates";
import { Icon } from "@/lib/icons";
import styles from "./nomzod.module.css";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

const LEVEL_LABEL: Record<string, string> = {
  intern: "Intern",
  mutaxassis: "Mutaxassis",
};

function money(min: number | null): string {
  if (!min) return "Kelishilgan";
  return `${min.toLocaleString("ru-RU")} so'm dan`;
}

export default function NomzodDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [c, setC] = useState<CandidateView | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [contact, setContact] = useState<CandidateContact | null>(null);
  const [pending, setPending] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [unlockErr, setUnlockErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const loadAuthed = useCallback(async (): Promise<void> => {
    const d = await fetchCandidateAuthed(id);
    if (d) {
      setC(d.candidate);
      setUnlocked(d.contactUnlocked);
      setContact(d.contact);
      if (d.contactUnlocked) setPending(false);
    } else setNotFound(true);
  }, [id]);

  useEffect(() => {
    let live = true;
    void hasSession().then(async (ok) => {
      if (!live) return;
      setSignedIn(ok);
      if (ok) {
        await loadAuthed();
      } else {
        const cv = await fetchCandidate(id);
        if (!live) return;
        if (cv) setC(cv);
        else setNotFound(true);
      }
    });
    return () => {
      live = false;
    };
  }, [id, loadAuthed]);

  const onUnlock = async (): Promise<void> => {
    if (!signedIn) {
      setRegisterOpen(true);
      return;
    }
    if (busy) return;
    setBusy(true);
    setUnlockErr(null);
    const r = await unlockContact(id);
    setBusy(false);
    if (r.ok || r.status === 409) {
      if (r.unlockStatus === "tasdiqlangan") {
        await loadAuthed();
      } else {
        setPending(true);
        if (r.amount) setAmount(r.amount);
      }
      return;
    }
    setUnlockErr(
      r.error === "demo_profile"
        ? "Demo profil — kontakt mavjud emas."
        : r.error === "unverified_limit"
          ? "Tekshirilmagan kompaniya uchun limit (3 ta). Obuna oling."
          : "Kontaktni ochib bo'lmadi. Qayta urinib ko'ring.",
    );
  };

  if (notFound) {
    return (
      <main className={styles.centerState}>
        <p className={styles.emptyTitle}>Nomzod topilmadi</p>
        <Link href="/nomzodlar" className={styles.backLink}>
          ← Barcha nomzodlar
        </Link>
      </main>
    );
  }

  if (!c) {
    return (
      <main className={styles.wrapper}>
        <div className={styles.skel} />
      </main>
    );
  }

  const initial = (c.displayName || "N").charAt(0).toUpperCase();

  return (
    <main className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/nomzodlar" className={styles.back}>
          ← Nomzodlar
        </Link>

        <section className={styles.card}>
          <div className={styles.headRow}>
            <span className={styles.avatar} aria-hidden="true">
              {c.photoUrl ? (
                <img src={c.photoUrl} alt="" className={styles.avatarImg} />
              ) : (
                initial
              )}
            </span>
            <div className={styles.headTexts}>
              <h1 className={styles.name}>
                {unlocked && contact?.fullName ? contact.fullName : c.displayName}
                {c.verified ? (
                  <span className={styles.seal} title="Tekshirilgan">
                    <Icon name="check" size={13} />
                  </span>
                ) : null}
              </h1>
              <p className={styles.role}>
                {c.role} · {DIRECTION_LABEL[c.direction] ?? c.direction}
              </p>
            </div>
            <span className={`${styles.score} num`} title="Ko'nikma bali">
              {c.score}
            </span>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Daraja</span>
              <span className={styles.statValue}>
                {LEVEL_LABEL[c.level] ?? c.level}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Arxetip</span>
              <span className={styles.statValue}>{c.archetype}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Joylashuv</span>
              <span className={styles.statValue}>{c.district || "Toshkent"}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Kutilma</span>
              <span className={`${styles.statValue} num`}>
                {money(c.salaryFrom)}
              </span>
            </div>
          </div>

          {/* Kontakt bloki: ochilgan / kutilmoqda / ochish */}
          {unlocked && contact ? (
            <div className={styles.contactBox}>
              <p className={styles.contactKicker}>
                <Icon name="check" size={14} /> Kontakt ochildi
              </p>
              <div className={styles.contactLinks}>
                {contact.username ? (
                  <a
                    className={styles.contactLink}
                    href={`https://t.me/${contact.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="send" size={16} /> @{contact.username}
                  </a>
                ) : null}
                {contact.portfolioUrl ? (
                  <a
                    className={styles.contactLink}
                    href={contact.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="globe" size={16} /> Portfolio
                  </a>
                ) : null}
                {!contact.username && !contact.portfolioUrl ? (
                  <span className={styles.contactMuted}>
                    Kontakt ma&apos;lumoti kiritilmagan.
                  </span>
                ) : null}
              </div>
            </div>
          ) : pending ? (
            <div className={styles.pendingBox}>
              <p className={styles.pendingKicker}>So&apos;rov yuborildi ✓</p>
              <p className={styles.pendingText}>
                {amount
                  ? `Narx: ${amount.toLocaleString("ru-RU")} so'm. To'lovdan so'ng moderator kontaktni ochadi.`
                  : "To'lovdan so'ng moderator kontaktni ochadi."}
              </p>
              <button
                type="button"
                className={styles.refresh}
                onClick={() => void loadAuthed()}
              >
                Holatni yangilash
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className={styles.cta}
                onClick={() => void onUnlock()}
                disabled={busy}
              >
                <Icon name="lock" size={16} />{" "}
                {busy ? "Yuborilmoqda..." : "Kontaktni ochish"}
              </button>
              <p className={styles.ctaNote}>
                {signedIn
                  ? "Nomzod bilan bog'lanish uchun kontaktni oching (obuna bepul ochadi)."
                  : "Nomzod bilan bog'lanish uchun ish beruvchi sifatida ro'yxatdan o'ting."}
              </p>
            </>
          )}
          {unlockErr ? <p className={styles.err}>{unlockErr}</p> : null}
        </section>

        {c.skills.length ? (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>Ko&apos;nikmalar</h2>
            <div className={styles.tags}>
              {c.skills.map((s) => (
                <span key={s} className={styles.tag}>
                  {s}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {c.about ? (
          <section className={styles.block}>
            <h2 className={styles.blockTitle}>O&apos;zi haqida</h2>
            <p className={styles.about}>{c.about}</p>
          </section>
        ) : null}
      </div>

      <RegisterSheet
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Nomzod bilan bog'lanish uchun ro'yxatdan o'ting"
      />
    </main>
  );
}
