"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EMPTY_DRAFT, VacancyForm } from "@/components/web/VacancyForm";
import { hasSession } from "@/lib/auth";
import { Icon } from "@/lib/icons";
import { createVacancy, type VacancyDraft } from "@/lib/vacancyMe";
import styles from "../vakansiyalarim.module.css";

const ERRORS: Record<string, string> = {
  vacancy_limit:
    "Obunasiz faqat 1 ta faol vakansiya bo'ladi. Avval mavjudini yoping yoki obuna rasmiylashtiring.",
  title_required: "Lavozim nomini yozing.",
  bad_direction: "Yo'nalishni tanlang.",
  unauthorized: "Sessiya tugadi. Qayta kiring.",
};

export default function YangiVakansiyaPage(): JSX.Element {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void hasSession().then((ok) => {
      if (!live) return;
      setSignedIn(ok);
      setChecked(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const submit = async (draft: VacancyDraft): Promise<void> => {
    setErr(null);
    const r = await createVacancy(draft);
    if (!r.ok) {
      setErr(ERRORS[r.error] ?? "Saqlab bo'lmadi. Qayta urinib ko'ring.");
      return;
    }
    router.push("/kompaniyam/vakansiyalar");
  };

  if (checked && !signedIn) {
    return (
      <main className={styles.centerState}>
        <span className={styles.guestIcon} aria-hidden="true">
          <Icon name="briefcase" size={26} />
        </span>
        <h1 className={styles.guestTitle}>Vakansiya joylash</h1>
        <p className={styles.guestText}>
          Vakansiya joylash uchun ish beruvchi sifatida tizimga kiring.
        </p>
        <Link href="/kirish" className={styles.guestBtn}>
          Kirish
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <nav className={styles.crumbs} aria-label="Yo'l">
              <Link href="/kompaniyam/vakansiyalar" className={styles.crumb}>
                Vakansiyalarim
              </Link>
              <span aria-hidden="true">/</span>
              <span>Yangi</span>
            </nav>
            <h1 className={styles.title}>Yangi vakansiya</h1>
          </div>
        </header>

        <VacancyForm
          initial={EMPTY_DRAFT}
          submitLabel="Joylash"
          onSubmit={submit}
          error={err}
        />
      </div>
    </main>
  );
}
