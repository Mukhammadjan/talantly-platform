"use client";

import { useTransition } from "react";
import { setRequestStatus } from "./actions";

interface Option {
  value: string;
  label: string;
}

export function RequestStatusSelect({
  requestId,
  status,
  options,
}: {
  requestId: string;
  status: string;
  options: Option[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className={`input-base w-full cursor-pointer py-1.5 pr-7 text-[13px] transition-opacity ${
        isPending ? "opacity-50" : ""
      }`}
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const formData = new FormData();
        formData.set("requestId", requestId);
        formData.set("status", e.target.value);
        startTransition(async () => {
          await setRequestStatus(formData);
        });
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
