"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { api } from "@/lib/api";
import { Icon } from "@/lib/icons";
import { DIRECTION_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import type { Candidate } from "@/lib/types";
import styles from "./xarita.module.css";

// ---- Yandex Maps JS API (2.1) minimal tiplari ----
interface YPlacemark {
  events: { add(ev: string, cb: () => void): void };
}
interface YMap {
  geoObjects: { add(o: YPlacemark): void; removeAll(): void };
  events: { add(ev: string, cb: () => void): void };
  getZoom(): number;
  setZoom(zoom: number, opts?: Record<string, unknown>): void;
  setCenter(
    center: [number, number],
    zoom?: number,
    opts?: Record<string, unknown>,
  ): void;
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

// Shahar markazlari — statik konstanta (odam darajasida koordinata YO'Q:
// baza faqat shaharni biladi, aniq manzil so'ralmagan — maxfiylik).
const CITY_COORDS: Record<string, [number, number]> = {
  toshkent: [41.311, 69.28],
  samarqand: [39.655, 66.976],
  buxoro: [39.768, 64.421],
  andijon: [40.783, 72.344],
  namangan: [41.004, 71.643],
  fargona: [40.39, 71.783],
};

/** "Farg'ona" har qanday apostrof varianti bilan → "fargona" (lug'at kaliti). */
function cityKey(city: string): string {
  return city.toLowerCase().replace(/[\u02bb\u02bc\u2019'`]/g, "").trim();
}

const UZBEKISTAN: [number, number] = [40.8, 67.5];

// Klaster pufagi: son + ostida shahar pill. ✓ va ball YO'Q — feed'da
// faqat tekshirilganlar, muhr bu yerda ma'lumot bermaydi.
function clusterTemplate(): string {
  return (
    '<div style="position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;">' +
    '<div style="width:$[properties.size]px;height:$[properties.size]px;border-radius:var(--r-full);background:$[properties.bg];color:var(--t-on-action);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:$[properties.fs]px;font-family:inherit;font-variant-numeric:tabular-nums;border:2px solid var(--t-white);box-shadow:var(--sh-float);">$[properties.count]</div>' +
    '<div style="padding:2px 8px;border-radius:var(--r-full);background:var(--t-white);color:var(--t-ink-1);font-size:13px;font-weight:600;font-family:inherit;box-shadow:var(--sh-raise);white-space:nowrap;">$[properties.city]</div>' +
    "</div>"
  );
}

/** Pufak o'lchami soniga qarab: <5 → 40/15, 5–15 → 48/17, >15 → 56/20. */
function bubbleSize(count: number): { size: number; fs: number } {
  if (count < 5) return { size: 40, fs: 15 };
  if (count <= 15) return { size: 48, fs: 17 };
  return { size: 56, fs: 20 };
}

interface CityGroup {
  city: string;
  coords: [number, number];
  talents: Candidate[];
}

export default function XaritaPage(): JSX.Element {
  const router = useRouter();
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [cands, setCands] = useState<Candidate[] | null>(null);
  const [dataErr, setDataErr] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"map" | "list">("map");
  const [selCity, setSelCity] = useState<string | null>(null);
  const elRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<YMapsApi | null>(null);
  const mapRef = useRef<YMap | null>(null);
  const selRef = useRef<string | null>(null);
  selRef.current = selCity;

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.back());

  // Ma'lumot — FAQAT Supabase (mock yo'q).
  const load = useCallback((): void => {
    setDataErr(false);
    setCands(null);
    api.getMapCandidates().then((list) => {
      if (list) setCands(list);
      else setDataErr(true);
    });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // Qidiruv: ism va ko'nikma (skill_tags) bo'yicha — ikkala rejim bitta holat.
  const filtered = useMemo(() => {
    if (!cands) return [];
    const q = query.trim().toLowerCase();
    if (!q) return cands;
    return cands.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }, [cands, query]);

  // Shahar guruhlari + "ko'rsatilmagan" (city null yoki "Boshqa").
  const { groups, unknown } = useMemo(() => {
    const map = new Map<string, CityGroup>();
    const unk: Candidate[] = [];
    for (const c of filtered) {
      const city = c.city?.trim();
      if (!city || city === "Boshqa") {
        unk.push(c);
        continue;
      }
      const coords = CITY_COORDS[cityKey(city)];
      if (!coords) {
        unk.push(c);
        continue;
      }
      const g = map.get(city) ?? { city, coords, talents: [] };
      g.talents.push(c);
      map.set(city, g);
    }
    const sorted = Array.from(map.values()).sort(
      (a, b) => b.talents.length - a.talents.length,
    );
    return { groups: sorted, unknown: unk };
  }, [filtered]);

  const selGroup = groups.find((g) => g.city === selCity) ?? null;

  // Yandex Maps skriptini yuklab, xaritani yaratamiz.
  useEffect(() => {
    let cancelled = false;

    const boot = (): void => {
      const ym = window.ymaps;
      if (!ym || cancelled) return;
      ym.ready(() => {
        if (cancelled || !elRef.current || mapRef.current) return;
        apiRef.current = ym;
        const map = new ym.Map(elRef.current, {
          center: UZBEKISTAN,
          zoom: 6,
          controls: [],
        });
        map.events.add("click", () => {
          if (selRef.current) setSelCity(null);
        });
        mapRef.current = map;
        setMapStatus("ready");
      });
    };

    if (window.ymaps) {
      boot();
    } else {
      const key = process.env.NEXT_PUBLIC_YANDEX_MAPS_APIKEY;
      const src = `https://api-maps.yandex.ru/2.1/?lang=uz_UZ${
        key ? `&apikey=${encodeURIComponent(key)}` : ""
      }`;
      let script = document.getElementById(
        "ymaps-sdk",
      ) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = "ymaps-sdk";
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", boot);
      script.addEventListener("error", () => {
        if (!cancelled) setMapStatus("error");
      });
    }

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  // Shahar klasterlarini chizish (qidiruv sonlarni yangilaydi).
  useEffect(() => {
    const ym = apiRef.current;
    const map = mapRef.current;
    if (!ym || !map || mapStatus !== "ready") return;

    map.geoObjects.removeAll();
    const Layout = ym.templateLayoutFactory.createClass(clusterTemplate());

    for (const g of groups) {
      const n = g.talents.length;
      const { size, fs } = bubbleSize(n);
      const half = size / 2;
      const pm = new ym.Placemark(
        g.coords,
        {
          count: String(n),
          city: g.city,
          size: String(size),
          fs: String(fs),
          // Tanlash = harakat — faqat shu yerda to'q sariq.
          bg: g.city === selCity ? "var(--t-action)" : "var(--t-ink-1)",
        },
        {
          iconLayout: Layout,
          iconShape: {
            type: "Rectangle",
            coordinates: [
              [-half, -half],
              [half, half + 30],
            ],
          },
        },
      );
      pm.events.add("click", () => {
        haptic("light");
        setSelCity(g.city);
      });
      map.geoObjects.add(pm);
    }
  }, [mapStatus, groups, selCity]);

  const zoomBy = (delta: number): void => {
    const map = mapRef.current;
    if (!map) return;
    haptic("light");
    map.setZoom(map.getZoom() + delta, { duration: 200 });
  };

  const locate = (): void => {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;
    haptic("light");
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setCenter([pos.coords.latitude, pos.coords.longitude], 12, {
        duration: 300,
      });
    });
  };

  const openTalent = (id: string): void => {
    haptic("light");
    router.push(`/nomzod/${id}`);
  };

  const row = (c: Candidate): JSX.Element => (
    <button
      key={c.id}
      type="button"
      className={styles.lrow}
      onClick={() => openTalent(c.id)}
    >
      <Avatar name={c.displayName} photoUrl={c.photoUrl} size={44} />
      <span className={styles.ltexts}>
        <span className={styles.lname}>{c.displayName}</span>
        <span className={styles.lsub}>
          {DIRECTION_LABELS[c.direction] ?? c.direction} ·{" "}
          {LEVEL_LABELS[c.level] ?? c.level}
        </span>
      </span>
      <Icon name="chevron" size={18} className={styles.lchev} />
    </button>
  );

  return (
    <main className={styles.wrap}>
      {/* Yandex xarita (attribution — litsenziya talabi, yopilmaydi) */}
      <div ref={elRef} className={styles.mapEl} />

      {mapStatus === "loading" && mode === "map" && (
        <div className={styles.overlay}>
          <span className={styles.spinner} />
          <p className={styles.overlayText}>Xarita yuklanmoqda...</p>
        </div>
      )}
      {mapStatus === "error" && mode === "map" && (
        <div className={styles.overlay}>
          <Icon name="map" size={28} className={styles.overlayIcon} />
          <p className={styles.overlayText}>
            Xarita yuklanmadi. Internet aloqasini tekshirib, qayta urinib
            ko&apos;ring.
          </p>
        </div>
      )}
      {dataErr && (
        <div className={styles.overlay}>
          <Icon name="info" size={28} className={styles.overlayIcon} />
          <p className={styles.overlayText}>
            Nomzodlar yuklanmadi. Qayta urinib ko&apos;ring.
          </p>
          <button type="button" className={styles.retryBtn} onClick={load}>
            Qayta urinish
          </button>
        </div>
      )}

      {/* Qidiruv — Telegram header tagidan 8px */}
      <div className={styles.search}>
        <Icon name="search" size={20} className={styles.sicon} />
        <input
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ism yoki ko'nikma qidirish"
        />
      </div>

      {/* Ro'yxat rejimi */}
      {mode === "list" && (
        <div className={styles.listPanel}>
          {cands === null && !dataErr ? (
            <p className={styles.listEmpty}>Yuklanmoqda...</p>
          ) : filtered.length === 0 && unknown.length === 0 ? (
            <p className={styles.listEmpty}>
              {query
                ? "Hech kim topilmadi. Boshqa so'z bilan qidirib ko'ring."
                : "Hali tekshirilgan talant yo'q."}
            </p>
          ) : (
            <>
              {groups.map((g) => (
                <section key={g.city} className={styles.lsection}>
                  <h2 className={styles.lhead}>
                    {g.city} — {g.talents.length} ta
                  </h2>
                  {g.talents.map(row)}
                </section>
              ))}
              {unknown.length > 0 && (
                <section className={styles.lsection}>
                  <h2 className={styles.lhead}>
                    Shahri ko&apos;rsatilmagan — {unknown.length} ta
                  </h2>
                  {unknown.map(row)}
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Xarita boshqaruvlari — zoom + locate */}
      {mode === "map" && (
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.ctrlBtn}
            onClick={locate}
            aria-label="Mening joylashuvim"
          >
            <Icon name="locate" size={20} />
          </button>
          <div className={styles.zoomCard}>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => zoomBy(1)}
              aria-label="Kattalashtirish"
            >
              <Icon name="plus" size={20} />
            </button>
            <span className={styles.ctrlDivider} aria-hidden="true" />
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => zoomBy(-1)}
              aria-label="Kichraytirish"
            >
              <Icon name="minus" size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Segmented control — Xarita / Ro'yxat */}
      <div className={styles.segmented} role="tablist" aria-label="Ko'rinish">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "map"}
          className={`${styles.segment} ${mode === "map" ? styles.segmentOn : ""}`}
          onClick={() => {
            haptic("light");
            setMode("map");
          }}
        >
          <Icon name="map" size={20} />
          Xarita
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "list"}
          className={`${styles.segment} ${mode === "list" ? styles.segmentOn : ""}`}
          onClick={() => {
            haptic("light");
            setMode("list");
            setSelCity(null);
          }}
        >
          <Icon name="list" size={20} />
          Ro&apos;yxat
        </button>
      </div>

      {/* Shahar sheet'i */}
      {mode === "map" && selCity && (
        <div className={styles.sheet}>
          <span className={styles.grabber} aria-hidden="true" />
          <h2 className={styles.sheetTitle}>
            {selCity} · {selGroup?.talents.length ?? 0} ta talant
          </h2>
          {selGroup && selGroup.talents.length > 0 ? (
            selGroup.talents.map(row)
          ) : (
            <p className={styles.listEmpty}>
              Bu shaharda hali tekshirilgan talant yo&apos;q. Boshqa shaharni
              tanlab ko&apos;ring.
            </p>
          )}
          {unknown.length > 0 && (
            <p className={styles.unknownRow}>
              Shahri ko&apos;rsatilmagan — {unknown.length} ta
            </p>
          )}
        </div>
      )}
    </main>
  );
}
