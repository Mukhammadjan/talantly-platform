"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/lib/icons";
import { formatSalary } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import {
  fetchApplications,
  fetchMyVacancy,
  setApplicationStatus,
  updateVacancy,
  type Application,
  type VacancyDetail,
  type VacancyStatus,
} from "@/lib/vacancyMe";
import styles from "./taklif.module.css";

type Tab = "all" | "boglanildi" | "yopildi";

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
  ikkalasi: "Intern yoki mutaxassis",
};

const FORMAT_LABEL: Record<string, string> = {
  ofis: "Ofis",
  masofaviy: "Masofaviy",
  aralash: "Aralash",
};

const STATUS_LABEL: Record<VacancyStatus, string> = {
  faol: "Faol",
  yopilgan: "Yopilgan",
  qoralama: "Qoralama",
};

// Nomzod bo'yicha keyingi qadamlar — "yangi" boshlang'ich holat, tanlanmaydi.
const STEPS: { key: Application["status"]; label: string }[] = [
  { key: "korildi", label: "Ko'rildi" },
  { key: "boglanildi", label: "Bog'lanildi" },
  { key: "yopildi", label: "Yopildi" },
];

function dateUz(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function salaryText(from: number | null, to: number | null): string {
  if (!from && !to) return "Kelishilgan";
  if (from && to) {
    return `${formatSalary(from).replace(" so'm", "")} – ${formatSalary(to)}`;
  }
  return formatSalary((from ?? to) as number);
}

export default function TaklifPage(): JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [tab, setTab] = useState<Tab>("all");
  const [vacancy, setVacancy] = useState<VacancyDetail | null | "missing">(null);
  const [apps, setApps] = useState<Application[] | null>(null);
  const [busyStatus, setBusyStatus] = useState(false);
  const [busyApp, setBusyApp] = useState<string | null>(null);

  const load = useCallback((): void => {
    void fetchMyVacancy(id).then((v) => setVacancy(v ?? "missing"));
    void fetchApplications(id).then((a) => setApps(a ?? []));
  }, [id]);

  useEffect(() => {
    initTelegram();
    load();
  }, [load]);

  useBackButton(() => router.push("/izlovchi/vakansiyalarim"));

  const toggleVacancy = async (): Promise<void> => {
    if (vacancy === null || vacancy === "missing" || busyStatus) return;
    haptic("light");
    setBusyStatus(true);
    await updateVacancy(id, {
      status: vacancy.status === "faol" ? "yopilgan" : "faol",
    });
    setBusyStatus(false);
    load();
  };

  const moveApp = async (
    app: Application,
    status: Application["status"],
  ): Promise<void> => {
    haptic("light");
    setBusyApp(app.id);
    const ok = await setApplicationStatus(app.id, status);
    setBusyApp(null);
    if (ok) {
      setApps((prev) =>
        (prev ?? []).map((a) => (a.id === app.id ? { ...a, status } : a)),
      );
    }
  };

  if (vacancy === "missing") {
    return (
      <main className="screen">
        <EmptyState
          icon={<Icon name="doc" size={24} />}
          title="Vakansiya topilmadi"
          text="U o'chirilgan yoki sizga tegishli bo'lmasligi mumkin."
        />
      </main>
    );
  }

  if (vacancy === null) {
    return (
      <main className="screen">
        <div className={styles.skelTitle} />
        <div className={styles.skelCard} />
      </main>
    );
  }

  const rows = apps ?? [];
  const contacted = rows.filter((a) => a.status === "boglanildi");
  const closed = rows.filter((a) => a.status === "yopildi");
  const shown =
    tab === "boglanildi" ? contacted : tab === "yopildi" ? closed : rows;

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "Hammasi", count: rows.length },
    { key: "boglanildi", label: "Bog'lanilgan", count: contacted.length },
    { key: "yopildi", label: "Yopilgan", count: closed.length },
  ];

  return (
    <main className="screen">
      <button
        type="button"
        className={styles.edit}
        onClick={() => void toggleVacancy()}
        disabled={busyStatus}
        aria-label={vacancy.status === "faol" ? "Yopish" : "Faollashtirish"}
      >
        <Icon name={vacancy.status === "faol" ? "lock" : "check"} size={20} />
      </button>

      <h1 className={styles.title}>{vacancy.title}</h1>
      <p className={styles.category}>
        {DIRECTION_LABEL[vacancy.direction] ?? vacancy.direction}
        <span
          className={`${styles.vStatus} ${
            vacancy.status === "faol"
              ? styles.vOn
              : vacancy.status === "qoralama"
                ? styles.vDraft
                : styles.vOff
          }`}
        >
          {STATUS_LABEL[vacancy.status]}
        </span>
      </p>

      <div className={styles.info}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Daraja:</span>
          <span className={styles.infoValue}>
            {LEVEL_LABEL[vacancy.level] ?? vacancy.level}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Ish formati:</span>
          <span className={styles.infoValue}>
            {vacancy.workFormats.map((f) => FORMAT_LABEL[f] ?? f).join(", ") ||
              "Ofis"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Manzil:</span>
          <span className={styles.infoValue}>
            {[vacancy.city, vacancy.district].filter(Boolean).join(", ") ||
              "Toshkent"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Maosh:</span>
          <span className={styles.infoValue}>
            {salaryText(vacancy.salaryFrom, vacancy.salaryTo)}
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${tab === t.key ? styles.tabOn : ""}`}
            onClick={() => {
              haptic("light");
              setTab(t.key);
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {apps === null ? (
        <div className={styles.skelCard} />
      ) : shown.length === 0 ? (
        <EmptyState
          icon={<Icon name="users" size={24} />}
          title={
            rows.length === 0 ? "Hozircha ariza yo'q" : "Bu bo'limda nomzod yo'q"
          }
          text={
            rows.length === 0
              ? "Vakansiya faol bo'lsa, mos nomzodlar ariza yuboradi."
              : undefined
          }
        />
      ) : (
        <div className={styles.list}>
          {shown.map((a) => (
            <div key={a.id} className={styles.card}>
              <button
                type="button"
                className={styles.cardHead}
                onClick={() => {
                  haptic("light");
                  router.push(`/nomzod/${a.talent.id}`);
                }}
              >
                <Avatar name={a.talent.name} size={40} />
                <span className={styles.name}>
                  {a.talent.name}
                  {a.talent.verified && (
                    <span className={styles.seal}>
                      <Icon name="check" size={10} />
                    </span>
                  )}
                </span>
                <Icon name="chevron" size={16} />
              </button>

              <div className={styles.mid}>
                <span className={styles.role}>
                  {DIRECTION_LABEL[a.talent.direction] ?? a.talent.direction}
                  {a.talent.city ? ` · ${a.talent.city}` : ""}
                </span>
                <span className={styles.date}>{dateUz(a.createdAt)}</span>
              </div>

              {a.note ? <p className={styles.note}>{a.note}</p> : null}

              <div className={styles.steps}>
                {STEPS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className={`${styles.step} ${a.status === s.key ? styles.stepOn : ""}`}
                    disabled={busyApp === a.id}
                    aria-pressed={a.status === s.key}
                    onClick={() => void moveApp(a, s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
