// Telegram Mini App poydevori. Birinchi bu ishlashi kerak (v2-1 §2).
// window.Telegram.WebApp bilan bevosita ishlaymiz.

interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TelegramBackButton {
  show: () => void;
  hide: () => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
}

export interface TelegramWebApp {
  initData: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  openLink?: (url: string) => void;
  onEvent?: (event: string, handler: () => void) => void;
  offEvent?: (event: string, handler: () => void) => void;
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  safeAreaInset?: SafeAreaInset;
  contentSafeAreaInset?: SafeAreaInset;
  BackButton?: TelegramBackButton;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
  CloudStorage?: {
    setItem: (
      key: string,
      value: string,
      cb?: (err: string | null, ok?: boolean) => void,
    ) => void;
    getItem: (
      key: string,
      cb: (err: string | null, value?: string) => void,
    ) => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function isInsideTelegram(): boolean {
  return Boolean(getWebApp()?.initData);
}

/** Design token'dan hex rang o'qiydi — Telegram chrome CSS palitraga mos qoladi
 *  (qotirilgan qiymat yo'q). */
function tokenColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : fallback;
}

let subscribed = false;

function applyViewport(tg: TelegramWebApp): void {
  const h =
    tg.viewportStableHeight ??
    tg.viewportHeight ??
    (typeof window !== "undefined" ? window.innerHeight : 0);
  if (h > 0) {
    document.documentElement.style.setProperty("--tg-vh", `${Math.round(h)}px`);
  }
}

function applySafeArea(tg: TelegramWebApp): void {
  const root = document.documentElement;
  const safeTop = tg.safeAreaInset?.top ?? 0;
  const contentTop = tg.contentSafeAreaInset?.top ?? 0;
  const safeBottom = tg.safeAreaInset?.bottom ?? 0;
  const contentBottom = tg.contentSafeAreaInset?.bottom ?? 0;
  root.style.setProperty("--tg-top", `${Math.max(0, safeTop + contentTop)}px`);
  root.style.setProperty(
    "--tg-bottom",
    `${Math.max(0, safeBottom + contentBottom)}px`,
  );
}

export interface InitOptions {
  /** Orange hero faqat auth/onboarding ekranida. */
  header?: "brand" | "accent";
}

/** ready() BIRINCHI render effectda chaqirilsin (kech = "Mini App not available"). */
export function initTelegram(opts: InitOptions = {}): TelegramWebApp | null {
  const tg = getWebApp();
  if (!tg) return null;
  tg.ready();
  tg.expand();
  try {
    const header =
      opts.header === "accent"
        ? tokenColor("--t-action", "#f26430")
        : tokenColor("--t-bg", "#f5f5f7");
    tg.setBackgroundColor(tokenColor("--t-bg", "#f5f5f7"));
    tg.setHeaderColor(header);
  } catch {
    /* eski klientlar rang override'ni qo'llamaydi — CSS baribir yorug' */
  }

  applyViewport(tg);
  applySafeArea(tg);
  if (!subscribed && tg.onEvent) {
    tg.onEvent("viewportChanged", () => applyViewport(tg));
    tg.onEvent("safeAreaChanged", () => applySafeArea(tg));
    tg.onEvent("contentSafeAreaChanged", () => applySafeArea(tg));
    subscribed = true;
  }
  return tg;
}

export function haptic(type: "success" | "error" | "light" = "light"): void {
  const fb = getWebApp()?.HapticFeedback;
  if (!fb) return;
  if (type === "light") fb.impactOccurred("light");
  else fb.notificationOccurred(type);
}

export function openLink(url: string): void {
  const tg = getWebApp();
  if (tg?.openLink) tg.openLink(url);
  else if (typeof window !== "undefined") window.open(url, "_blank", "noopener");
}
