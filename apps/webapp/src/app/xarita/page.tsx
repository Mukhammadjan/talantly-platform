"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CandidateCard } from "@/components/CandidateCard";
import { EmptyState } from "@/components/EmptyState";
import { Sheet } from "@/components/Sheet";
import { Icon } from "@/lib/icons";
import { api } from "@/lib/api";
import { CANDIDATES } from "@/mock/data";
import { haptic, initTelegram } from "@/lib/telegram";
import type { Zone } from "@/lib/types";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./xarita.module.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 1.8;

export default function XaritaPage(): JSX.Element {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[] | null>(null);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [sel, setSel] = useState<Zone | null>(null);

  useEffect(() => {
    initTelegram();
    let live = true;
    api.getZones().then((z) => {
      if (live) setZones(z);
    });
    return () => {
      live = false;
    };
  }, []);
  useBackButton(() => router.back());

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => (zones ?? []).filter((z) => !q || z.district.toLowerCase().includes(q)),
    [zones, q],
  );

  const selCandidates = sel
    ? CANDIDATES.filter((c) => c.district === sel.district)
    : [];

  const zoomBy = (d: number): void => {
    haptic("light");
    setZoom((v) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(v + d).toFixed(2))));
  };

  return (
    <main className={styles.wrap}>
      {/* ---- Xarita qatlami (zoom bilan) ---- */}
      <div className={styles.world} style={{ transform: `scale(${zoom})` }}>
        <svg
          className={styles.mapSvg}
          viewBox="0 0 390 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* asos */}
          <rect width="390" height="800" fill="var(--t-bg)" />
          {/* kvartallar */}
          <rect x="24" y="60" width="120" height="90" rx="10" className={styles.block} />
          <rect x="250" y="90" width="110" height="120" rx="10" className={styles.block} />
          <rect x="40" y="330" width="100" height="80" rx="10" className={styles.block} />
          <rect x="260" y="420" width="100" height="110" rx="10" className={styles.block} />
          <rect x="60" y="620" width="130" height="100" rx="10" className={styles.block} />
          {/* park */}
          <path
            d="M20 470 Q30 420 90 430 Q150 440 150 500 Q150 570 80 575 Q15 580 20 470z"
            className={styles.park}
          />
          <circle cx="320" cy="700" r="52" className={styles.park} />
          {/* anhor (suv) */}
          <path d="M-10 250 Q120 230 200 260 Q300 300 400 270" className={styles.water} />
          {/* asosiy prospekt (vertikal) */}
          <path d="M195 -10 Q185 200 205 420 Q220 620 190 810" className={styles.roadCasing} />
          <path d="M195 -10 Q185 200 205 420 Q220 620 190 810" className={styles.roadMain} />
          {/* gorizontal katta ko'cha */}
          <path d="M-10 380 Q140 360 250 385 Q330 400 400 390" className={styles.roadCasing} />
          <path d="M-10 380 Q140 360 250 385 Q330 400 400 390" className={styles.roadMain} />
          {/* ikkinchi darajali ko'chalar */}
          <path d="M-10 150 L400 130" className={styles.roadSecond} />
          <path d="M-10 560 Q200 545 400 570" className={styles.roadSecond} />
          <path d="M90 -10 L110 810" className={styles.roadSecond} />
          <path d="M310 -10 L290 810" className={styles.roadSecond} />
          {/* mayda yo'laklar */}
          <path d="M-10 300 L400 320" className={styles.lane} />
          <path d="M-10 470 L400 455" className={styles.lane} />
          <path d="M-10 690 L400 675" className={styles.lane} />
          <path d="M40 -10 L55 810" className={styles.lane} />
          <path d="M350 -10 L340 810" className={styles.lane} />
          {/* ko'cha nomlari */}
          <text x="210" y="368" className={styles.roadLabel}>
            Alisher Navoiy ko&apos;chasi
          </text>
          <text x="212" y="120" className={styles.roadLabel} transform="rotate(87 212 120)">
            Abay ko&apos;chasi
          </text>
          <text x="215" y="520" className={styles.roadLabel} transform="rotate(83 215 520)">
            Afrosiyob ko&apos;chasi
          </text>
          <text x="42" y="555" className={styles.parkLabel}>
            Shahar bog&apos;i
          </text>
        </svg>

        {/* men */}
        <span className={styles.me} style={{ left: "50%", top: "47%" }}>
          <span className={styles.mePulse} />
        </span>

        {/* tuman pinlari */}
        {visible.map((z) => (
          <button
            key={z.district}
            type="button"
            className={styles.pin}
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
            onClick={() => {
              haptic("light");
              setSel(z);
            }}
          >
            <span className={styles.pinCircle}>{z.count}</span>
            <span className={styles.pinLabel}>
              <Icon name="check" size={11} className={styles.pinCheck} />
              {z.district}
            </span>
          </button>
        ))}
      </div>

      {/* ---- Ustki panel: qidiruv + ro'yxat ---- */}
      <div className={styles.topBar}>
        <div className={styles.search}>
          <Icon name="search" size={18} className={styles.sicon} />
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tuman qidirish..."
          />
        </div>
        <button
          type="button"
          className={styles.roundBtn}
          onClick={() => router.push("/izlovchi")}
          aria-label="Ro'yxat"
        >
          <Icon name="users" size={18} />
        </button>
      </div>

      {/* ---- Zoom boshqaruvi ---- */}
      <div className={styles.zoomBox}>
        <button
          type="button"
          className={styles.zoomBtn}
          onClick={() => zoomBy(0.2)}
          aria-label="Yaqinlashtirish"
        >
          +
        </button>
        <span className={styles.zoomDivider} />
        <button
          type="button"
          className={styles.zoomBtn}
          onClick={() => zoomBy(-0.2)}
          aria-label="Uzoqlashtirish"
        >
          −
        </button>
      </div>
      <button
        type="button"
        className={styles.locate}
        onClick={() => {
          haptic("light");
          setZoom(1);
        }}
        aria-label="Markazga qaytish"
      >
        <Icon name="pin" size={18} />
      </button>

      {/* ---- Pastki eslatma ---- */}
      <div className={styles.note}>
        <Icon name="info" size={13} />
        Taxminiy zonalar — aniq manzil maxfiy
      </div>

      {/* ---- Tuman sheet ---- */}
      <Sheet
        open={sel !== null}
        onClose={() => setSel(null)}
        title={sel ? `${sel.district} · ${sel.count} nomzod` : ""}
      >
        {selCandidates.length === 0 ? (
          <EmptyState
            icon={<Icon name="users" size={24} />}
            title="Bu tumanda ochiq profil yo'q"
            text="Nomzodlar tekshiruvdan o'tgach shu yerda ko'rinadi."
          />
        ) : (
          <div className={styles.sheetList}>
            {selCandidates.map((c) => (
              <CandidateCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </Sheet>
    </main>
  );
}
