"use client";

import { useMemo, useState } from "react";
import {
  DIRECTION_LABELS_UZ,
  LEVEL_LABELS_UZ,
  WORK_FORMAT_LABELS_UZ,
  type Direction,
  type TalentLevel,
  type WorkFormat,
} from "@talantly/shared";
import type { PublicTalentCard } from "@/lib/server/publicData";
import { TalentCard } from "./TalentCard";

interface Filters {
  direction: Direction | null;
  level: TalentLevel | null;
  workFormat: WorkFormat | null;
}

const EMPTY: Filters = { direction: null, level: null, workFormat: null };

function Chip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all active:scale-95 ${
        active
          ? "border-orange bg-orange-tint text-orange-deep"
          : "border-line bg-surface text-ink-soft hover:border-orange"
      }`}
    >
      {label}
    </button>
  );
}

export function Catalog({
  talents,
}: {
  talents: PublicTalentCard[];
}): JSX.Element {
  const [filters, setFilters] = useState<Filters>(EMPTY);

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const visible = useMemo(
    () =>
      talents.filter((talent) => {
        if (filters.direction && talent.direction !== filters.direction) {
          return false;
        }
        if (filters.level && talent.level !== filters.level) return false;
        if (
          filters.workFormat &&
          !talent.workFormats.includes(filters.workFormat)
        ) {
          return false;
        }
        return true;
      }),
    [talents, filters],
  );

  const hasFilters =
    filters.direction !== null ||
    filters.level !== null ||
    filters.workFormat !== null;

  return (
    <div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="label-caps mr-1">Yo&apos;nalish</span>
          {(Object.keys(DIRECTION_LABELS_UZ) as Direction[]).map(
            (direction) => (
              <Chip
                key={direction}
                label={DIRECTION_LABELS_UZ[direction]}
                active={filters.direction === direction}
                onToggle={() => toggle("direction", direction)}
              />
            ),
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="label-caps mr-1">Daraja</span>
          {(Object.keys(LEVEL_LABELS_UZ) as TalentLevel[]).map((level) => (
            <Chip
              key={level}
              label={LEVEL_LABELS_UZ[level]}
              active={filters.level === level}
              onToggle={() => toggle("level", level)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="label-caps mr-1">Ish formati</span>
          {(Object.keys(WORK_FORMAT_LABELS_UZ) as WorkFormat[]).map(
            (format) => (
              <Chip
                key={format}
                label={WORK_FORMAT_LABELS_UZ[format]}
                active={filters.workFormat === format}
                onToggle={() => toggle("workFormat", format)}
              />
            ),
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY)}
              className="ml-1 text-[12px] font-semibold text-orange hover:text-orange-deep"
            >
              Tozalash ✕
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-card border border-line bg-surface p-8 text-center shadow-soft">
          <p className="text-[28px]" aria-hidden>
            🔍
          </p>
          <p className="mt-2 text-[14px] font-semibold">
            Bu filtrlar bo&apos;yicha nomzod topilmadi
          </p>
          <p className="mt-1 text-[13px] text-ink-soft">
            Filtrlarni kengaytirib ko&apos;ring — katalog muntazam
            yangilanadi.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((talent) => (
            <TalentCard key={talent.id} talent={talent} withCta />
          ))}
        </div>
      )}
    </div>
  );
}
