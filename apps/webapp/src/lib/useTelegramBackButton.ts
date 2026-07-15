"use client";

import { useEffect, useRef } from "react";
import { getWebApp } from "./telegram";

/**
 * Drives Telegram's native BackButton instead of a custom in-app back arrow.
 * Pass a handler to show the button; pass `null` to hide it (e.g. on the first
 * step of a wizard). The handler is kept in a ref, so passing a fresh inline
 * arrow each render is fine — the native subscription only re-runs when the
 * shown/hidden state flips.
 */
export function useTelegramBackButton(handler: (() => void) | null): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  const enabled = handler !== null;
  useEffect(() => {
    const backButton = getWebApp()?.BackButton;
    if (!backButton) return;
    if (!enabled) {
      backButton.hide();
      return;
    }
    const onClick = (): void => handlerRef.current?.();
    backButton.onClick(onClick);
    backButton.show();
    return () => {
      backButton.offClick(onClick);
      backButton.hide();
    };
  }, [enabled]);
}
