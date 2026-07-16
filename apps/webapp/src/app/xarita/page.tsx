"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
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
  events: { add(ev: string, cb: () => void): void };
  destroy(): void;
}
interface YMapsApi {
  ready(cb: () => void): void;
  templateLayoutFactory: { createClass(template: string): unknown };
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

interface Pin {
  id: string;
  name: string;
  role: string;
  district: string;
  score: number;
  coords: [number, number];
}

// Demo nomzod pinlari — Toshkent tumanlari (taxminiy zonalar).
const PINS: Pin[] = [
  { id: "c1", name: "Kamola O.", role: "Frontend dasturchi", district: "Yunusobod", score: 92, coords: [41.364, 69.289] },
  { id: "c2", name: "Jasur T.", role: "UI/UX dizayner", district: "Chilonzor", score: 88, coords: [41.275, 69.204] },
  { id: "c3", name: "Nilufar S.", role: "SMM menejer", district: "Mirzo Ulug'bek", score: 79, coords: [41.327, 69.334] },
  { id: "c2", name: "Jasur T.", role: "UI/UX dizayner", district: "Yakkasaroy", score: 88, coords: [41.293, 69.248] },
  { id: "c1", name: "Kamola O.", role: "Frontend dasturchi", district: "Shayxontohur", score: 92, coords: [41.33, 69.24] },
];

const TASHKENT: [number, number] = [41.311, 69.28];

// Brend pin (HTML layout) — qora doira + apelsin halqa + ball, ostida ism.
function pinTemplate(): string {
  return (
    '<div style="position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;">' +
    '<div style="width:46px;height:46px;border-radius:999px;background:var(--t-ink-1);color:var(--t-white);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;font-family:inherit;border:3px solid var(--t-action);box-shadow:0 8px 20px rgba(23,23,27,.28);">$[properties.score]</div>' +
    '<div style="display:flex;align-items:center;gap:3px;padding:3px 9px;border-radius:999px;background:var(--t-white);color:var(--t-ink-1);font-size:11px;font-weight:600;font-family:inherit;box-shadow:0 3px 10px rgba(23,23,27,.16);white-space:nowrap;">' +
    '<span style="color:var(--t-verified);font-weight:800;">✓</span>$[properties.name]</div>' +
    "</div>"
  );
}

export default function XaritaPage(): JSX.Element {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<Pin | null>(null);
  const elRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<YMapsApi | null>(null);
  const mapRef = useRef<YMap | null>(null);
  const selRef = useRef<Pin | null>(null);
  selRef.current = sel;

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
        const map = new ym.Map(
          elRef.current,
          { center: TASHKENT, zoom: 11, controls: ["zoomControl"] },
          { suppressMapOpenBlock: true },
        );
        map.events.add("click", () => {
          if (selRef.current) setSel(null);
        });
        mapRef.current = map;
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
    const Layout = ym.templateLayoutFactory.createClass(pinTemplate());
    const q = query.trim().toLowerCase();

    PINS.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q),
    ).forEach((p) => {
      const pm = new ym.Placemark(
        p.coords,
        { score: String(p.score), name: p.name },
        {
          iconLayout: Layout,
          iconShape: {
            type: "Rectangle",
            coordinates: [
              [-40, -78],
              [40, 6],
            ],
          },
        },
      );
      pm.events.add("click", () => {
        haptic("light");
        setSel(p);
      });
      map.geoObjects.add(pm);
    });
  }, [status, query]);

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

      {/* Pin tanlanganda — pastki preview karta */}
      {sel ? (
        <div className={styles.preview}>
          <button
            type="button"
            className={styles.close}
            onClick={() => setSel(null)}
            aria-label="Yopish"
          >
            <Icon name="close" size={16} />
          </button>
          <div className={styles.phead}>
            <Avatar name={sel.name} size={48} />
            <div className={styles.ptexts}>
              <span className={styles.pname}>
                {sel.name}
                <span className={styles.pseal}>
                  <Icon name="check" size={10} />
                </span>
              </span>
              <span className={styles.prole}>
                {sel.role} · {sel.district}
              </span>
            </div>
            <span className={styles.pscore}>{sel.score}</span>
          </div>
          <button
            type="button"
            className={styles.pbtn}
            onClick={() => {
              haptic("light");
              router.push(`/nomzod/${sel.id}`);
            }}
          >
            Profilni ochish
            <Icon name="arrow" size={18} />
          </button>
        </div>
      ) : (
        <div className={styles.note}>
          <Icon name="info" size={13} />
          Pinni bosing — nomzod kartasi ochiladi
        </div>
      )}
    </main>
  );
}
