"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  param: string;
  label: string;
  options: FilterOption[];
}

export function FilterBar({ filters }: { filters: FilterDef[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = (param: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(param, value);
    } else {
      next.delete(param);
    }
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  const hasActive = filters.some((f) => searchParams.get(f.param));

  return (
    <div
      className={`flex flex-wrap items-end gap-3 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      {filters.map((filter) => (
        <label key={filter.param} className="grid gap-1">
          <span className="label-caps">{filter.label}</span>
          <select
            className="input-base w-auto min-w-[130px] cursor-pointer py-2 pr-8 text-[13px]"
            value={searchParams.get(filter.param) ?? ""}
            onChange={(e) => setParam(filter.param, e.target.value)}
          >
            <option value="">Hammasi</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      {hasActive ? (
        <button
          type="button"
          className="btn-ghost mb-0.5"
          onClick={() =>
            startTransition(() => {
              router.replace(pathname, { scroll: false });
            })
          }
        >
          Tozalash ✕
        </button>
      ) : null}
    </div>
  );
}
