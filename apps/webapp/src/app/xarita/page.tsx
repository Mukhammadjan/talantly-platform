"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./xarita.module.css";

// ---- Yandex Maps JS API (2.1) minimal tiplari ----
interface YPlacemark {
  events: { add(ev: string, cb: () => void): void };
}
interface YMap {
  geoObjects: { add(o: YPlacemark): void; removeAll(): void };
  destroy(): void;
}
interface YMapsApi {
  ready(cb: () => void): void;
  Map: new (
    el: HTMLElement,
    state: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => YMap;
  Placemark: new (
    coords: [number, number],
    props: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => YPlacemark;
}
declare global {
  interface Window {
    ymaps?: YMapsApi;
  }
}

// Demo nomzod pinlari — Toshkent tumanlari (taxminiy zonalar).
const PINS: {
  id: string;
  name: string;
  role: string;
  score: number;
  coords: [number, number];
}[] = [
  { id: "c1", name: "Kamola O.", role: "Frontend dasturchi", score: 92, coords: [41.364, 69.289] },
  { id: "c2", name: "Jasur T.", role: "UI/UX dizayner", score: 88, coords: [41.275, 69.204] },
  { id: "c3", name: "Nilufar S.", role: "SMM menejer", score: 79, coords: [41.327, 69.334] },
  { id: "c2", name: "Jasur T.", role: "UI/UX dizayner", score: 88, coords: [41.293, 69.248] },
  { id: "c1", name: "Kamola O.", role: "Frontend dasturchi", score: 92, coords: [41.33, 69.24] },
];

const TASHKENT: [number, number] = [41.311, 69.28];

export default function XaritaPage(): JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const elRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<YMapsApi | null>(null);
  const mapRef = useRef<YMap | null>(null);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.back());

  // Yandex Maps skriptini yuklab, xaritani yaratamiz.
  useEffect(() => {
    let cancelled = false;

    const boot = (): void => {
      const ym = window.ymaps;
      if (!ym || cancelled) return;
      ym.ready(() => {
        if (cancelled || !elRef.current || mapRef.current) return;
        apiRef.current = ym;
        mapRef.current = new ym.Map(
          elRef.current,
          { center: TASHKENT, zoom: 11, controls: ["zoomControl"] },
          { suppressMapOpenBlock: true },
        );
        setStatus("ready");
      });
    };

    if (window.ymaps) {
      boot();
    } else {
      const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_APIKEY;
      const src = `https://api-maps.yandex.ru/2.1/?lang=uz_UZ${
        key ? `&apikey=${encodeURIComponent(key)}` : ""
      }`;
      let script = document.getElementById("ymaps-sdk") as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = "ymaps-sdk";
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", boot);
      script.addEventListener("error", () => {
        if (!cancelled) setStatus("error");
      });
    }

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  // Pinlarni chizish (qidiruv filtri bilan).
  useEffect(() => {
    const ym = apiRef.current;
    const map = mapRef.current;
    if (!ym || !map || status !== "ready") return;

    map.geoObjects.removeAll();
    const q = query.trim().toLowerCase();
    PINS.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q),
    ).forEach((p) => {
      const pm = new ym.Placemark(
        p.coords,
        {
          iconContent: String(p.score),
          hintContent: `${p.name} · ${p.role}`,
        },
        { preset: "islands#darkOrangeCircleIcon" },
      );
      pm.events.add("click", () => {
        haptic("light");
        router.push(`/nomzod/${p.id}`);
      });
      map.geoObjects.add(pm);
    });
  }, [status, query, router]);

  return (
    <main className={styles.wrap}>
      {/* Yandex xarita */}
      <div ref={elRef} className={styles.mapEl} />

      {status === "loading" && (
        <div className={styles.overlay}>
          <span className={styles.spinner} />
          <p className={styles.overlayText}>Xarita yuklanmoqda...</p>
        </div>
      )}
      {status === "error" && (
        <div className={styles.overlay}>
          <Icon name="map" size={28} className={styles.overlayIcon} />
          <p className={styles.overlayText}>
            Xarita yuklanmadi. Internet aloqasini tekshirib, qayta urinib
            ko&apos;ring.
          </p>
        </div>
      )}

      {/* Ustki panel: qidiruv + ro'yxat */}
      <div className={styles.topBar}>
        <div className={styles.search}>
          <Icon name="search" size={18} className={styles.sicon} />
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nomzod qidirish..."
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

      {/* Pastki eslatma */}
      <div className={styles.note}>
        <Icon name="info" size={13} />
        Pinni bosing — nomzod profili ochiladi
      </div>
    </main>
  );
}
