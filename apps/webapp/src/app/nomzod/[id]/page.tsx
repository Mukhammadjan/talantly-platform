"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { EmptyState } from "@/components/EmptyState";
import { Sheet } from "@/components/Sheet";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { SENT_VACANCIES } from "@/mock/data";
import { DIRECTION_LABELS, LEVEL_LABELS, formatSalary } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import type { Candidate } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./nomzod.module.css";

const CARD_NUMBER = "8600 1234 5678 9012";

export default function NomzodDetailPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [c, setC] = useState<Candidate | null>(null);
  const [failed, setFailed] = useState(false);
  const [pay, setPay] = useState(false);
  const [plan, setPlan] = useState<"bir" | "obuna">("bir");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [offer, setOffer] = useState(false);
  const [pickVac, setPickVac] = useState(SENT_VACANCIES[0]?.id ?? "");
  const [offerSent, setOfferSent] = useState(false);
  const [demoMsg, setDemoMsg] = useState(false);
  const [sending, setSending] = useState(false);
  const [subActive, setSubActive] = useState(false);
  const [contact, setContact] = useState<{
    username: string | null;
    fullName: string | null;
    portfolioUrl: string | null;
  } | null>(null);

  const copyCard = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ""));
      haptic("success");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      haptic("error");
    }
  };

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getCandidateDetail(params.id).then((x) => {
      if (!live) return;
      if (x) {
        setC(x.candidate);
        if (x.contactUnlocked) {
          setContact(x.contact);
          setSent(true);
        }
      } else setFailed(true);
    });
    void api.getCompanyStatus().then((st) => {
      if (live && st) setSubActive(st.subscriptionActive);
    });
    return () => {
      live = false;
    };
  }, [params.id]);
  useBackButton(() => router.back());

  if (failed) {
    return (
      <main className="screen">
        <EmptyState
          icon={<Icon name="users" size={24} />}
          title="Nomzod topilmadi"
          action={
            <Button variant="secondary" onClick={() => router.push("/izlovchi")}>
              Ro&apos;yxatga qaytish
            </Button>
          }
        />
      </main>
    );
  }

  if (!c) {
    return (
      <main className={styles.wrap}>
        <div className={styles.body} />
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.body}>
        <div className={styles.headCard}>
          <Avatar name={c.displayName} photoUrl={c.photoUrl} size={80} />
          <h1 className={styles.name}>{c.displayName}</h1>
          <p className={styles.role}>
            {c.role} · {c.archetype}
          </p>
          <div className={styles.tags}>
            {c.verified ? (
              <Badge variant="verified" icon={<Icon name="check" size={14} />}>
                Tekshirilgan
              </Badge>
            ) : null}
            <Badge variant="action">{c.score} ball</Badge>
          </div>
        </div>

        <div className={styles.stats}>
          <Stat icon="pin" label="Tuman" value={c.district} />
          <Stat icon="briefcase" label="Daraja" value={LEVEL_LABELS[c.level]} />
          <Stat icon="star" label="Yo'nalish" value={DIRECTION_LABELS[c.direction]} />
        </div>

        <Section title="Ko'nikmalar">
          <div className={styles.skills}>
            {c.skills.map((s) => (
              <span key={s} className={styles.skill}>
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Haqida">
          <p className={styles.about}>{c.about}</p>
        </Section>

        <Section title="Kutilayotgan maosh">
          <p className={styles.salary}>{formatSalary(c.salaryFrom)}</p>
        </Section>

        {contact ? (
          <Card className={styles.contactCard}>
            <p className={styles.ckicker}>Kontakt ochildi ✓</p>
            <p className={styles.contactName}>{contact.fullName ?? c.displayName}</p>
            {contact.username ? (
              <a
                className={styles.contactLink}
                href={`https://t.me/${contact.username}`}
                target="_blank"
                rel="noreferrer"
              >
                @{contact.username}
              </a>
            ) : (
              <p className={styles.lockText}>
                Telegram username ko&apos;rsatilmagan — admin bog&apos;lab beradi.
              </p>
            )}
            {contact.portfolioUrl ? (
              <a
                className={styles.contactLink}
                href={contact.portfolioUrl}
                target="_blank"
                rel="noreferrer"
              >
                Portfolio
              </a>
            ) : null}
          </Card>
        ) : (
          <Card className={styles.locked}>
            <span className={styles.lockIcon}>
              <Icon name="lock" size={20} />
            </span>
            <span className={styles.lockTexts}>
              <span className={styles.lockTitle}>CV va telefon raqami</span>
              <span className={styles.lockText}>
                So&apos;rov yuborilgach ochiladi.
              </span>
            </span>
          </Card>
        )}
      </div>

      <div className={styles.cta}>
        {demoMsg ? (
          <p className={styles.demoBar}>Bu demo profil — so&apos;rov yuborilmaydi.</p>
        ) : null}
        {sent ? (
          <p className={styles.sentBar}>
            So&apos;rov yuborildi ✓ 24 soat ichida bog&apos;lanamiz.
          </p>
        ) : (
          <div className={styles.ctaCol}>
            <Button
              full
              icon={<Icon name="send" size={20} />}
              onClick={() => {
                if (c.isDemo) {
                  haptic("error");
                  setDemoMsg(true);
                  return;
                }
                setPay(true);
              }}
            >
              Nomzodni so&apos;rash
            </Button>
            {offerSent ? (
              <p className={styles.offerDone}>
                <Icon name="check" size={16} /> Taklif yuborildi
              </p>
            ) : (
              <Button
                full
                variant="secondary"
                icon={<Icon name="briefcase" size={20} />}
                onClick={() => setOffer(true)}
              >
                Vakansiyaga taklif qilish
              </Button>
            )}
          </div>
        )}
      </div>

      <Sheet open={pay} onClose={() => setPay(false)} title="Kontaktni ochish">
        {subActive ? (
          <p className={styles.subActiveNote}>
            ✓ Obunangiz faol — kontakt to&apos;lovsiz ochiladi.
          </p>
        ) : (
          <div className={styles.plans}>
            <Chip
              label="Bir martalik · 99 000"
              active={plan === "bir"}
              onClick={() => setPlan("bir")}
            />
            <Chip
              label="Oylik obuna · 2 500 000"
              active={plan === "obuna"}
              onClick={() => setPlan("obuna")}
            />
          </div>
        )}
        <Card className={styles.cardInfo}>
          <p className={styles.ckicker}>To&apos;lov kartasi</p>
          <div className={styles.cardRow}>
            <p className={styles.cnum}>{CARD_NUMBER}</p>
            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copied : ""}`}
              onClick={() => void copyCard()}
              aria-label="Karta raqamini nusxalash"
            >
              <Icon name={copied ? "check" : "copy"} size={16} />
              {copied ? "Nusxalandi" : "Nusxa"}
            </button>
          </div>
          <p className={styles.cowner}>Talantly MChJ</p>
        </Card>
        <p className={styles.payHint}>
          Kartaga o&apos;tkazing va chek skrinshotini botga yuboring.
        </p>
        <Button
          full
          loading={sending}
          onClick={() => {
            setSending(true);
            void api.sendRequest(c.id).then((r) => {
              setSending(false);
              if (!r.ok) {
                haptic("error");
                setPay(false);
                if (r.demo) setDemoMsg(true);
                return;
              }
              void api
                .createUnlock(c.id, plan === "obuna" ? "obuna" : "bir_martalik")
                .then(() => api.getCandidateDetail(c.id))
                .then((d) => {
                  if (d?.contactUnlocked) setContact(d.contact);
                });
              haptic("success");
              setPay(false);
              setSent(true);
            });
          }}
        >
          Skrinshotni yubordim
        </Button>
      </Sheet>

      <Sheet open={offer} onClose={() => setOffer(false)} title="Vakansiyani tanlang">
        <div className={styles.offerList}>
          {SENT_VACANCIES.map((v) => {
            const on = pickVac === v.id;
            return (
              <button
                key={v.id}
                type="button"
                className={`${styles.offerRow} ${on ? styles.offerOn : ""}`}
                onClick={() => {
                  haptic("light");
                  setPickVac(v.id);
                }}
              >
                <span className={`${styles.radio} ${on ? styles.radioOn : ""}`}>
                  {on ? <Icon name="check" size={12} /> : null}
                </span>
                <span className={styles.offerTexts}>
                  <span className={styles.offerTitle}>{v.title}</span>
                  <span className={styles.offerSalary}>
                    {formatSalary(v.salaryFrom).replace(" so'm", "")} –{" "}
                    {formatSalary(v.salaryTo)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <Button
          full
          onClick={() => {
            haptic("success");
            setOffer(false);
            setOfferSent(true);
          }}
        >
          Taklif yuborish
        </Button>
      </Sheet>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: "pin" | "briefcase" | "star";
  label: string;
  value: string;
}): JSX.Element {
  return (
    <div className={styles.stat}>
      <Icon name={icon} size={18} className={styles.statIcon} />
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className={styles.section}>
      <p className={styles.skicker}>{title}</p>
      {children}
    </div>
  );
}
