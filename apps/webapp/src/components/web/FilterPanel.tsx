"use client";

import { AiSmartToggle } from "./AiSmartToggle";
import { Checkbox } from "./Checkbox";
import styles from "./FilterPanel.module.css";

export interface FilterState {
  direction: string;
  level: string;
  workFormat: string;
  aiSort: boolean;
}

const DIRECTIONS = [
  { value: "dasturlash", label: "Dasturlash" },
  { value: "dizayn", label: "Dizayn" },
  { value: "marketing", label: "Marketing" },
  { value: "sotuv", label: "Sotuv" },
  { value: "data", label: "Data" },
  { value: "boshqa", label: "Boshqa" },
];

const LEVELS = [
  { value: "intern", label: "Intern" },
  { value: "mutaxassis", label: "Mutaxassis" },
];

const FORMATS = [
  { value: "ofis", label: "Ofis" },
  { value: "masofaviy", label: "Masofaviy" },
  { value: "aralash", label: "Aralash" },
];

function Group({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}): JSX.Element {
  return (
    <div className={styles.group}>
      <p className={styles.groupTitle}>{title}</p>
      <div className={styles.rows}>
        {options.map((o) => (
          <Checkbox
            key={o.value}
            label={o.label}
            checked={selected === o.value}
            onChange={(c) => onSelect(c ? o.value : "")}
          />
        ))}
      </div>
    </div>
  );
}

export function FilterPanel({
  state,
  onChange,
}: {
  state: FilterState;
  onChange: (next: Partial<FilterState>) => void;
}): JSX.Element {
  const hasActive = Boolean(state.direction || state.level || state.workFormat);

  return (
    <aside className={styles.panel} aria-label="Filtrlar">
      <div className={styles.head}>
        <p className={styles.headTitle}>Filtr</p>
        {hasActive ? (
          <button
            type="button"
            className={styles.reset}
            onClick={() =>
              onChange({ direction: "", level: "", workFormat: "" })
            }
          >
            Tozalash
          </button>
        ) : null}
      </div>

      <Group
        title="Yo'nalish"
        options={DIRECTIONS}
        selected={state.direction}
        onSelect={(v) => onChange({ direction: v })}
      />
      <Group
        title="Daraja"
        options={LEVELS}
        selected={state.level}
        onSelect={(v) => onChange({ level: v })}
      />
      <Group
        title="Ish formati"
        options={FORMATS}
        selected={state.workFormat}
        onSelect={(v) => onChange({ workFormat: v })}
      />

      {/* AI-saralash — eng pastda (bitta-filled qoidasi: toggle, tugma emas). */}
      <AiSmartToggle
        checked={state.aiSort}
        onChange={(c) => onChange({ aiSort: c })}
      />
    </aside>
  );
}
