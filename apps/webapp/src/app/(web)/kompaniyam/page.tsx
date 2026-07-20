"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasSession } from "@/lib/auth";
import {
  type MyCompany,
  fetchMyCompany,
  updateMyCompany,
} from "@/lib/companyMe";
import { Icon } from "@/lib/icons";
import styles from "./kompaniyam.module.css";

const DIRECTIONS: { key: string; label: string }[] = [
  { key: "dasturlash", label: "Dasturlash" },
  { key: "dizayn", label: "Dizayn" },
  { key: "marketing", label: "Marketing" },
  { key: "sotuv", label: "Sotuv" },
  { key: "data", label: "Data" },
  { key: "boshqa", label: "Boshqa" },
];

const LEVELS: { key: string; label: string }[] = [
  { key: "intern", label: "Intern" },
  { key: "mutaxassis", label: "Mutaxassis" },
  { key: "ikkalasi", label: "Ikkalasi" },
];

export default function KompaniyamPage(): JSX.Element {
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [subActive, setSubActive] = useState(false);
  const [verified, setVerified] = useState(false);

  const [name, setName] = useState("");
  const [activity, setActivity] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [about, setAbout] = useState("");
  const [directions, setDirections] = useState<string[]>([]);
  const [level, setLevel] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fill = (c: MyCompany): void => {
    setName(c.name === "Kompaniya" ? "" : c.name);
    setActivity(c.activityType);
    setCity(c.city);
    setDistrict(c.district);
    setAbout(c.about);
    setDirections(c.directions);
    setLevel(c.neededLevel);
    setVerified(c.verified);
  };

  useEffect(() => {
    let live = true;
    void hasSession().then(async (ok) => {
      if (!live) return;
      setSignedIn(ok);
      setChecked(true);
      if (ok) {
        const d = await fetchMyCompany();
        if (!live) return;
        if (d) {
          fill(d.company);
          setSubActive(d.subscriptionActive);
        }
        setLoaded(true);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  const toggleDir = (key: string): void => {
    setDirections((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
    );
    setSaved(false);
  };

  const save = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (saving) return;
    if (name.trim().length < 2) {
      setErr("Kompaniya nomi kamida 2 belgi.");
      return;
    }
    setSaving(true);
    setErr(null);
    setSaved(false);
    const c = await updateMyCompany({
      name: name.trim(),
      activityType: activity,
      city,
      district,
      about,
      directions,
      neededLevel: level,
    });
    setSaving(false);
    if (c) {
      fill(c);
      setSaved(true);
    } else {
      setErr("Saqlab bo'lmadi. Qayta urinib ko'ring.");
    }
  };

  if (checked && !signedIn) {
    return (
      <main className={styles.centerState}>
        <span className={styles.guestIcon} aria-hidden="true">
          <Icon name="briefcase" size={26} />
        </span>
        <h1 className={styles.guestTitle}>Kompaniya kabineti</h1>
        <p className={styles.guestText}>
          Kompaniya profilini boshqarish uchun ish beruvchi sifatida tizimga
          kiring.
        </p>
        <Link href="/kirish" className={styles.guestBtn}>
          Kirish
        </Link>
      </main>
    );
  }

  if (!checked || !loaded) {
    return (
      <main className={styles.wrap}>
        <div className={styles.inner}>
          <div className={styles.skel} />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <span className={styles.logo} aria-hidden="true">
            {(name || "K").charAt(0).toUpperCase()}
          </span>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              {name || "Kompaniya"}
              {verified ? (
                <span className={styles.seal} title="Tekshirilgan">
                  <Icon name="check" size={13} />
                </span>
              ) : null}
            </h1>
            <div className={styles.badges}>
              <span
                className={`${styles.badge} ${verified ? styles.badgeGood : styles.badgeMuted}`}
              >
                {verified ? "Tekshirilgan" : "Tekshirilmagan"}
              </span>
              <span
                className={`${styles.badge} ${subActive ? styles.badgeGood : styles.badgeMuted}`}
              >
                {subActive ? "Obuna faol" : "Obuna yo'q"}
              </span>
            </div>
          </div>
          <div className={styles.heroLinks}>
            <Link
              href="/kompaniyam/vakansiyalar"
              className={styles.vakansiyaLink}
            >
              <Icon name="doc" size={16} /> Vakansiyalarim
            </Link>
            <Link href="/nomzodlar" className={styles.nomzodLink}>
              Nomzodlar →
            </Link>
          </div>
        </header>

        <form className={styles.card} onSubmit={(e) => void save(e)}>
          <h2 className={styles.cardTitle}>Profil ma&apos;lumotlari</h2>

          <label className={styles.field}>
            <span className={styles.label}>Kompaniya nomi</span>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              placeholder="Masalan: Novatech"
              maxLength={120}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Faoliyat turi</span>
              <input
                className={styles.input}
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value);
                  setSaved(false);
                }}
                placeholder="IT, savdo, ta'lim..."
                maxLength={120}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Shahar</span>
              <input
                className={styles.input}
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setSaved(false);
                }}
                placeholder="Toshkent"
                maxLength={80}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Tuman</span>
            <input
              className={styles.input}
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setSaved(false);
              }}
              placeholder="Yunusobod"
              maxLength={80}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Kompaniya haqida</span>
            <textarea
              className={styles.textarea}
              value={about}
              onChange={(e) => {
                setAbout(e.target.value);
                setSaved(false);
              }}
              placeholder="Qisqacha tavsif..."
              maxLength={2000}
              rows={4}
            />
          </label>

          <div className={styles.field}>
            <span className={styles.label}>Kerakli yo&apos;nalishlar</span>
            <div className={styles.chips}>
              {DIRECTIONS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  className={`${styles.chip} ${directions.includes(d.key) ? styles.chipOn : ""}`}
                  onClick={() => toggleDir(d.key)}
                  aria-pressed={directions.includes(d.key)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Kerakli daraja</span>
            <div className={styles.chips}>
              {LEVELS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  className={`${styles.chip} ${level === l.key ? styles.chipOn : ""}`}
                  onClick={() => {
                    setLevel(l.key);
                    setSaved(false);
                  }}
                  aria-pressed={level === l.key}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            {saved ? (
              <span className={styles.savedMsg}>
                <Icon name="check" size={14} /> Saqlandi
              </span>
            ) : null}
            {err ? <span className={styles.errMsg}>{err}</span> : null}
          </div>
        </form>
      </div>
    </main>
  );
}
