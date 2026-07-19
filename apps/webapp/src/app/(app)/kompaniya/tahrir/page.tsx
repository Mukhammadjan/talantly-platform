"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { Input } from "@/components/Input";
import { Sheet } from "@/components/Sheet";
import { Icon } from "@/lib/icons";
import { haptic, initTelegram } from "@/lib/telegram";
import { useBackButton } from "@/lib/useBackButton";
import styles from "./tahrir.module.css";

const KINDS = ["IT kompaniya", "Savdo", "Ishlab chiqarish", "Xizmat"];
const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Andijon", "Namangan"];
const DIRECTIONS = ["Dasturlash", "Dizayn", "Marketing", "Sotuv", "Data", "Boshqa"];

export default function KompaniyaTahrirPage(): JSX.Element {
  const router = useRouter();
  const [name, setName] = useState("Novatech");
  const [kind, setKind] = useState("IT kompaniya");
  const [city, setCity] = useState("Toshkent");
  const [about, setAbout] = useState(
    "Mahsulot jamoasi — veb va mobil yechimlar. Yosh, tashabbuskor mutaxassislarni izlaymiz.",
  );
  const [needed, setNeeded] = useState<string[]>(["Dasturlash", "Dizayn", "Marketing"]);
  const [saving, setSaving] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    initTelegram();
  }, []);
  useBackButton(() => router.push("/kompaniya"));

  const toggleNeeded = (d: string): void => {
    setNeeded((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const save = (): void => {
    haptic("success");
    setSaving(true);
    window.setTimeout(() => router.push("/kompaniya"), 500);
  };

  return (
    <main className="screen">
      <h1 className={styles.h}>Profilni tahrirlash</h1>

      <div className={styles.form}>
        <Input
          label="Kompaniya nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Field label="Kompaniya turi">
          {KINDS.map((k) => (
            <Chip key={k} label={k} active={kind === k} onClick={() => setKind(k)} />
          ))}
        </Field>

        <Field label="Shahar">
          {CITIES.map((c) => (
            <Chip key={c} label={c} active={city === c} onClick={() => setCity(c)} />
          ))}
        </Field>

        <label className={styles.field}>
          <span className={styles.flabel}>Haqida</span>
          <textarea
            className={styles.textarea}
            rows={4}
            maxLength={300}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </label>

        <Field label="Kerakli yo'nalishlar">
          {DIRECTIONS.map((d) => (
            <Chip
              key={d}
              label={d}
              active={needed.includes(d)}
              onClick={() => toggleNeeded(d)}
            />
          ))}
        </Field>

        <Button full loading={saving} disabled={name.trim().length < 2} onClick={save}>
          Saqlash
        </Button>
      </div>

      {/* Xavfli hudud */}
      <div className={styles.danger}>
        <p className={styles.dkicker}>Xavfli hudud</p>
        <button
          type="button"
          className={styles.deleteRow}
          onClick={() => {
            haptic("light");
            setDelOpen(true);
          }}
        >
          <span className={styles.dicon}>
            <Icon name="close" size={18} />
          </span>
          <span className={styles.dtexts}>
            <span className={styles.dtitle}>Akkauntni o&apos;chirish</span>
            <span className={styles.dtext}>
              Profil, vakansiyalar va barcha ma&apos;lumotlar o&apos;chiriladi.
            </span>
          </span>
          <Icon name="chevron" size={18} className={styles.dchev} />
        </button>
      </div>

      <Sheet open={delOpen} onClose={() => setDelOpen(false)} title="Akkauntni o'chirish">
        <p className={styles.sheetText}>
          Akkauntingiz va barcha ma&apos;lumotlaringiz butunlay o&apos;chiriladi.
          Bu amalni ortga qaytarib <b>bo&apos;lmaydi</b>. Davom etasizmi?
        </p>
        <div className={styles.sheetBtns}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => setDelOpen(false)}
          >
            Bekor qilish
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={() => {
              haptic("error");
              router.replace("/welcome");
            }}
          >
            O&apos;chirish
          </button>
        </div>
      </Sheet>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className={styles.field}>
      <span className={styles.flabel}>{label}</span>
      <div className={styles.chips}>{children}</div>
    </div>
  );
}
