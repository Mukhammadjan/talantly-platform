"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

/**
 * Two-step inline confirm: first click arms the button, second click
 * submits the surrounding form. Arms auto-reset after 4 seconds.
 */
export function ConfirmButton({
  label,
  confirmLabel = "Tasdiqlaysizmi?",
  className = "btn-ghost",
  armedClassName = "btn-primary",
}: {
  label: string;
  confirmLabel?: string;
  className?: string;
  armedClassName?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!armed) {
    return (
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          setArmed(true);
          timer.current = setTimeout(() => setArmed(false), 4000);
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <button type="submit" className={armedClassName} disabled={pending}>
      {pending ? "Bajarilmoqda…" : confirmLabel}
    </button>
  );
}
