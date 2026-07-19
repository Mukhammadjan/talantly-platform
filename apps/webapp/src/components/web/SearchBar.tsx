"use client";

import { Icon } from "@/lib/icons";
import { Select } from "./Select";
import styles from "./SearchBar.module.css";

const LOCATIONS = [
  { value: "", label: "Butun O'zbekiston" },
  { value: "Toshkent", label: "Toshkent" },
  { value: "Samarqand", label: "Samarqand" },
  { value: "Buxoro", label: "Buxoro" },
  { value: "Andijon", label: "Andijon" },
  { value: "Namangan", label: "Namangan" },
];

const SALARY = [
  { value: "", label: "Oylik: barchasi" },
  { value: "3000000", label: "3 mln+" },
  { value: "5000000", label: "5 mln+" },
  { value: "8000000", label: "8 mln+" },
  { value: "12000000", label: "12 mln+" },
];

const SORT = [
  { value: "recent", label: "Avval yangilari" },
  { value: "salary", label: "Oylik bo'yicha" },
];

const POPULAR = ["Frontend", "Dizayner", "SMM", "Sotuv", "Data analitik"];

export interface SearchState {
  query: string;
  location: string;
  minSalary: string;
  sort: string;
}

export function SearchBar({
  state,
  onChange,
  onSubmit,
}: {
  state: SearchState;
  onChange: (next: Partial<SearchState>) => void;
  onSubmit: () => void;
}): JSX.Element {
  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <div className={styles.searchField}>
          <Icon name="search" size={20} className={styles.sicon} />
          <input
            className={styles.input}
            value={state.query}
            onChange={(e) => onChange({ query: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder="Kasb, ko'nikma yoki kompaniya"
            aria-label="Vakansiya qidirish"
          />
        </div>
        <Select
          ariaLabel="Joylashuv"
          value={state.location}
          onChange={(v) => onChange({ location: v })}
          options={LOCATIONS}
        />
        <Select
          ariaLabel="Oylik"
          value={state.minSalary}
          onChange={(v) => onChange({ minSalary: v })}
          options={SALARY}
        />
        <Select
          ariaLabel="Saralash"
          value={state.sort}
          onChange={(v) => onChange({ sort: v })}
          options={SORT}
        />
        <button type="button" className={styles.submit} onClick={onSubmit}>
          Qidirish
        </button>
      </div>
      <div className={styles.popular}>
        <span className={styles.popularLabel}>Ommabop:</span>
        {POPULAR.map((p) => (
          <button
            key={p}
            type="button"
            className={styles.chip}
            onClick={() => {
              onChange({ query: p });
              onSubmit();
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
