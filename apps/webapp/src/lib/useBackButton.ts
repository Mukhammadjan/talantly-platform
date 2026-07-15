"use client";

import { useEffect, useRef } from "react";
import { getWebApp } from "./telegram";

/**
 * Telegram BackButton'ni boshqaradi — o'z strelkamiz chizilmaydi.
 * handler=null → tugma yashiriladi (masalan sehrgarning 1-qadamida).
 */
export function useBackButton(handler: (() => void) | null): void {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });

  const enabled = handler !== null;
  useEffect(() => {
    const bb = getWebApp()?.BackButton;
    if (!bb) return;
    if (!enabled) {
      bb.hide();
      return;
    }
    const cb = (): void => ref.current?.();
    bb.onClick(cb);
    bb.show();
    return () => {
      bb.offClick(cb);
      bb.hide();
    };
  }, [enabled]);
}
