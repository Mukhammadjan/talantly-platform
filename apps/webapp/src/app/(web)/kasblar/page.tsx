import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/lib/icons";
import { getDb } from "@/lib/server/db";
import { showDemo } from "@/lib/server/settings";
import styles from "./kasblar.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kasblar — yo'nalishlar bo'yicha amaliyot",
  description:
    "Dasturlash, dizayn, marketing, sotuv va data yo'nalishlari bo'yicha " +
    "ochiq amaliyot va ish o'rinlari. Yo'nalishni tanlang va tekshirilgan " +
    "kompaniyalarga ariza bering.",
  alternates: { canonical: "/kasblar" },
  openGraph: {
    title: "Kasblar · Talantly",
    description:
      "Yo'nalishlar bo'yicha ochiq amaliyot va ish o'rinlari.",
    url: "/kasblar",
  },
};

const DIRECTIONS: {
  key: string;
  label: string;
  icon: IconName;
  blurb: string;
}[] = [
  {
    key: "dasturlash",
    label: "Dasturlash",
    icon: "board",
    blurb: "Frontend, backend, mobil va full-stack yo'nalishlari",
  },
  {
    key: "dizayn",
    label: "Dizayn",
    icon: "sparkle",
    blurb: "UI/UX, grafik va mahsulot dizayni",
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: "globe",
    blurb: "SMM, kontent, targeting va analitika",
  },
  {
    key: "sotuv",
    label: "Sotuv",
    icon: "briefcase",
    blurb: "B2B/B2C savdo, akkaunt boshqaruvi",
  },
  {
    key: "data",
    label: "Data",
    icon: "grid",
    blurb: "Data tahlil, analitika va hisobot",
  },
  {
    key: "boshqa",
    label: "Boshqa",
    icon: "star",
    blurb: "Qolgan yo'nalishlardagi ish o'rinlari",
  },
];

// Faol, demo bo'lmagan vakansiyalarni yo'nalish bo'yicha sanaymiz.
async function directionCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  try {
    // Listing bilan bir xil: demo toggle yoqilgan bo'lsa demolarni ham sanaymiz.
    let q = getDb()
      .from("vacancies")
      .select("direction")
      .eq("status", "faol")
      .limit(2000);
    if (!(await showDemo())) q = q.eq("is_demo", false);
    const { data } = await q;
    for (const row of (data ?? []) as { direction: string | null }[]) {
      if (row.direction) counts[row.direction] = (counts[row.direction] ?? 0) + 1;
    }
  } catch {
    // Baza yetib bo'lmasa — sanoqsiz ko'rsatamiz (sahifa baribir foydali).
  }
  return counts;
}

export default async function KasblarPage(): Promise<JSX.Element> {
  const counts = await directionCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <span className={styles.kicker}>
            <Icon name="briefcase" size={14} /> KASBLAR
          </span>
          <h1 className={styles.h1}>Yo'nalishni tanlang</h1>
          <p className={styles.lead}>
            Har bir yo'nalish bo'yicha tekshirilgan kompaniyalarning ochiq
            amaliyot va ish o'rinlari. Sizga mosini toping va ariza bering.
          </p>
        </header>

        <div className={styles.grid}>
          {DIRECTIONS.map((d) => {
            const n = counts[d.key] ?? 0;
            return (
              <Link
                key={d.key}
                href={`/vakansiyalar?direction=${d.key}`}
                className={styles.card}
              >
                <span className={styles.iconTile} aria-hidden="true">
                  <Icon name={d.icon} size={22} />
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.cardName}>{d.label}</span>
                  <span className={styles.cardBlurb}>{d.blurb}</span>
                </span>
                <span className={styles.cardFoot}>
                  <span className={`${styles.count} num`}>
                    {n > 0 ? `${n} ta ochiq o'rin` : "Hozircha yo'q"}
                  </span>
                  <Icon name="chevron" size={16} />
                </span>
              </Link>
            );
          })}
        </div>

        {total > 0 ? (
          <p className={styles.totalNote}>
            Jami <span className={`${styles.totalNum} num`}>{total}</span> ta
            ochiq o'rin.{" "}
            <Link href="/vakansiyalar" className={styles.allLink}>
              Barchasini ko&apos;rish →
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
