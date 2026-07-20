"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { VacancyForm } from "@/components/web/VacancyForm";
import { hasSession } from "@/lib/auth";
import { Icon } from "@/lib/icons";
import {
  fetchApplications,
  fetchMyVacancy,
  setApplicationStatus,
  updateVacancy,
  type Application,
  type VacancyDetail,
  type VacancyDraft,
  type VacancyStatus,
} from "@/lib/vacancyMe";
import list from "../vakansiyalarim.module.css";
import styles from "./tahrir.module.css";

const DIRECTION_LABEL: Record<string, string> = {
  dasturlash: "Dasturlash",
  dizayn: "Dizayn",
  marketing: "Marketing",
  sotuv: "Sotuv",
  data: "Data",
  boshqa: "Boshqa",
};

const STATUS_LABEL: Record<VacancyStatus, string> = {
  faol: "Faol",
  yopilgan: "Yopilgan",
  qoralama: "Qoralama",
};

const APP_STATUS: {
  key: Application["status"];
  label: string;
  cls: "new" | "seen" | "contact" | "closed";
}[] = [
  { key: "yangi", label: "Yangi", cls: "new" },
  { key: "korildi", label: "Ko'rildi", cls: "seen" },
  { key: "boglanildi", label: "Bog'lanildi", cls: "contact" },
  { key: "yopildi", label: "Yopildi", cls: "closed" },
];

const SAVE_ERRORS: Record<string, string> = {
  vacancy_limit:
    "Obunasiz faqat 1 ta faol vakansiya bo'ladi. Avval boshqasini yoping.",
  title_required: "Lavozim nomini yozing.",
  bad_direction: "Yo'nalishni tanlang.",
  forbidden: "Bu vakansiya sizning kompaniyangizga tegishli emas.",
};

function dateUz(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function VakansiyaTahrirPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [vacancy, setVacancy] = useState<VacancyDetail | null | "missing">(null);
  const [apps, setApps] = useState<Application[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busyStatus, setBusyStatus] = useState(false);
  const [busyApp, setBusyApp] = useState<string | null>(null);

  const load = useCallback((): void => {
    void fetchMyVacancy(id).then((v) => setVacancy(v ?? "missing"));
    void fetchApplications(id).then((a) => setApps(a ?? []));
  }, [id]);

  useEffect(() => {
    let live = true;
    void hasSession().then((ok) => {
      if (!live) return;
      setSignedIn(ok);
      setChecked(true);
      if (ok) load();
    });
    return () => {
      live = false;
    };
  }, [load]);

  const save = async (draft: VacancyDraft): Promise<void> => {
    setErr(null);
    setSaved(false);
    const r = await updateVacancy(id, draft);
    if (!r.ok) {
      setErr(SAVE_ERRORS[r.error] ?? "Saqlab bo'lmadi. Qayta urinib ko'ring.");
      return;
    }
    setSaved(true);
    load();
  };

  const changeStatus = async (status: VacancyStatus): Promise<void> => {
    setBusyStatus(true);
    setErr(null);
    const r = await updateVacancy(id, { status });
    setBusyStatus(false);
    if (!r.ok) {
      setErr(SAVE_ERRORS[r.error] ?? "Holatni o'zgartirib bo'lmadi.");
      return;
    }
    load();
  };

  const changeApp = async (
    app: Application,
    status: Application["status"],
  ): Promise<void> => {
    setBusyApp(app.id);
    const ok = await setApplicationStatus(app.id, status);
    setBusyApp(null);
    if (ok) {
      setApps((prev) =>
        (prev ?? []).map((a) => (a.id === app.id ? { ...a, status } : a)),
      );
    }
  };

  if (checked && !signedIn) {
    return (
      <main className={list.centerState}>
        <span className={list.guestIcon} aria-hidden="true">
          <Icon name="briefcase" size={26} />
        </span>
        <h1 className={list.guestTitle}>Vakansiyani tahrirlash</h1>
        <p className={list.guestText}>
          Davom etish uchun ish beruvchi sifatida tizimga kiring.
        </p>
        <Link href="/kirish" className={list.guestBtn}>
          Kirish
        </Link>
      </main>
    );
  }

  if (vacancy === "missing") {
    return (
      <main className={list.centerState}>
        <h1 className={list.guestTitle}>Vakansiya topilmadi</h1>
        <p className={list.guestText}>
          U o&apos;chirilgan bo&apos;lishi yoki sizning kompaniyangizga tegishli
          bo&apos;lmasligi mumkin.
        </p>
        <Link href="/kompaniyam/vakansiyalar" className={list.guestBtn}>
          Vakansiyalarim
        </Link>
      </main>
    );
  }

  if (!checked || vacancy === null) {
    return (
      <main className={list.wrap}>
        <div className={list.inner}>
          <div className={list.skel} />
        </div>
      </main>
    );
  }

  return (
    <main className={list.wrap}>
      <div className={list.inner}>
        <header className={list.head}>
          <div>
            <nav className={list.crumbs} aria-label="Yo'l">
              <Link href="/kompaniyam/vakansiyalar" className={list.crumb}>
                Vakansiyalarim
              </Link>
              <span aria-hidden="true">/</span>
              <span>{vacancy.title}</span>
            </nav>
            <h1 className={list.title}>{vacancy.title}</h1>
            <p className={styles.sub}>
              {DIRECTION_LABEL[vacancy.direction] ?? vacancy.direction} ·{" "}
              {dateUz(vacancy.createdAt)} da joylangan
            </p>
          </div>

          <div className={styles.statusBox}>
            <span
              className={`${list.badge} ${
                vacancy.status === "faol"
                  ? list.badgeOn
                  : vacancy.status === "qoralama"
                    ? list.badgeDraft
                    : list.badgeOff
              }`}
            >
              {STATUS_LABEL[vacancy.status]}
            </span>
            {vacancy.status === "faol" ? (
              <button
                type="button"
                className={list.actionGhost}
                disabled={busyStatus}
                onClick={() => void changeStatus("yopilgan")}
              >
                Yopish
              </button>
            ) : (
              <button
                type="button"
                className={list.actionPrimary}
                disabled={busyStatus}
                onClick={() => void changeStatus("faol")}
              >
                Faollashtirish
              </button>
            )}
            {vacancy.status === "faol" ? (
              <Link href={`/vakansiya/${vacancy.id}`} className={list.actionGhost}>
                Saytda ko&apos;rish
              </Link>
            ) : null}
          </div>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>Ma&apos;lumotlar</h2>
          <VacancyForm
            key={vacancy.id + vacancy.status}
            initial={{
              title: vacancy.title,
              direction: vacancy.direction,
              level: vacancy.level,
              salaryFrom: vacancy.salaryFrom,
              salaryTo: vacancy.salaryTo,
              city: vacancy.city,
              district: vacancy.district,
              workFormats: vacancy.workFormats,
              description: vacancy.description,
            }}
            submitLabel="Saqlash"
            onSubmit={save}
            error={err}
          />
          {saved ? (
            <p className={styles.savedMsg}>
              <Icon name="check" size={14} /> Saqlandi
            </p>
          ) : null}
        </section>

        <section className={styles.section} id="arizalar">
          <div className={styles.appsHead}>
            <h2 className={styles.h2}>
              Arizalar{" "}
              {apps ? <span className={`${styles.count} num`}>{apps.length}</span> : null}
            </h2>
          </div>

          {apps === null ? (
            <div className={list.skel} />
          ) : apps.length === 0 ? (
            <div className={list.empty}>
              <span className={list.emptyIcon} aria-hidden="true">
                <Icon name="users" size={24} />
              </span>
              <p className={list.emptyTitle}>Hozircha ariza yo&apos;q</p>
              <p className={list.emptyText}>
                Vakansiya faol bo&apos;lsa, mos nomzodlar uni ko&apos;radi va
                ariza yuboradi.
              </p>
            </div>
          ) : (
            <ul className={styles.apps}>
              {apps.map((a) => (
                <li key={a.id} className={styles.app}>
                  <span className={styles.avatar} aria-hidden="true">
                    {a.talent.name.charAt(0).toUpperCase()}
                  </span>

                  <div className={styles.appMain}>
                    <p className={styles.appName}>
                      {a.talent.name}
                      {a.talent.verified ? (
                        <span className={styles.seal} title="Tekshirilgan">
                          <Icon name="check" size={11} />
                        </span>
                      ) : null}
                    </p>
                    <p className={styles.appMeta}>
                      {[
                        DIRECTION_LABEL[a.talent.direction] ?? a.talent.direction,
                        a.talent.city,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                      {" · "}
                      {dateUz(a.createdAt)}
                    </p>
                    {a.note ? <p className={styles.note}>{a.note}</p> : null}
                  </div>

                  <div className={styles.appSide}>
                    <div className={styles.appStatuses}>
                      {APP_STATUS.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          className={`${styles.st} ${a.status === s.key ? styles[s.cls] : ""}`}
                          disabled={busyApp === a.id}
                          aria-pressed={a.status === s.key}
                          onClick={() => void changeApp(a, s.key)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <Link
                      href={`/nomzodlar/${a.talent.id}`}
                      className={styles.profileLink}
                    >
                      Profil <Icon name="chevron" size={14} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
