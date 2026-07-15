export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface TelegramBackButton {
  show: () => void;
  hide: () => void;
  onClick: (handler: () => void) => void;
  offClick: (handler: () => void) => void;
}

export interface TelegramWebApp {
  initData: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  ready: () => void;
  expand: () => void;
  close: () => void;
  setBackgroundColor: (color: string) => void;
  setHeaderColor: (color: string) => void;
  openLink?: (url: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
  onEvent?: (event: string, handler: () => void) => void;
  safeAreaInset?: SafeAreaInset;
  contentSafeAreaInset?: SafeAreaInset;
  /** Height of the visible area; `viewportStableHeight` excludes transient UI
   *  (keyboard, expanding toolbar) and is the value to size layouts against. */
  viewportHeight?: number;
  viewportStableHeight?: number;
  isExpanded?: boolean;
  BackButton?: TelegramBackButton;
}

interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

const BRAND_BG = "#F5F5F7";

/** Reads a hex color straight from the design tokens so the Telegram chrome
 *  stays in sync with the CSS palette (no duplicated hardcoded values). */
function tokenColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : fallback;
}

export interface InitTelegramOptions {
  /** "brand" = light background (default); "accent" = orange, for the orange
   *  hero on auth/onboarding screens. */
  header?: "brand" | "accent";
}

/** Signals readiness and harmonizes chrome colors with the brand background. */
export function initTelegramUi(
  opts: InitTelegramOptions = {},
): TelegramWebApp | null {
  const webApp = getWebApp();
  if (!webApp) return null;
  webApp.ready();
  webApp.expand();
  try {
    const headerColor =
      opts.header === "accent"
        ? tokenColor("--orange", "#f26430")
        : tokenColor("--bg", BRAND_BG);
    webApp.setBackgroundColor(tokenColor("--bg", BRAND_BG));
    webApp.setHeaderColor(headerColor);
  } catch {
    // Older Telegram clients do not support color overrides — brand CSS still applies.
  }
  const theme = webApp.themeParams;
  const root = document.documentElement;
  if (theme.text_color) root.style.setProperty("--tg-text", theme.text_color);
  if (theme.hint_color) root.style.setProperty("--tg-hint", theme.hint_color);

  // Never trust 100vh in a Mini App — the real drawable height is
  // viewportStableHeight. Mirror it into --tg-vh and keep it fresh as Telegram
  // resizes (keyboard, expand). `.min-h-app` reads this var.
  applyViewport(webApp);
  if (!viewportSubscribed && webApp.onEvent) {
    webApp.onEvent("viewportChanged", () => applyViewport(webApp));
    viewportSubscribed = true;
  }

  // Fullscreen Mini Apps (opened without Telegram's header) run under the
  // status bar and the floating close/menu controls. Mirror Telegram's safe
  // area + content safe area into CSS vars so the shell can pad clear of them.
  // In compact mode these insets are ~0, so that layout is unchanged.
  applySafeArea(webApp);
  if (!safeAreaSubscribed && webApp.onEvent) {
    webApp.onEvent("safeAreaChanged", () => applySafeArea(webApp));
    webApp.onEvent("contentSafeAreaChanged", () => applySafeArea(webApp));
    safeAreaSubscribed = true;
  }
  return webApp;
}

let safeAreaSubscribed = false;
let viewportSubscribed = false;

function applyViewport(webApp: TelegramWebApp): void {
  const height =
    webApp.viewportStableHeight ??
    webApp.viewportHeight ??
    (typeof window !== "undefined" ? window.innerHeight : 0);
  if (height > 0) {
    document.documentElement.style.setProperty(
      "--tg-vh",
      `${Math.round(height)}px`,
    );
  }
}

function applySafeArea(webApp: TelegramWebApp): void {
  const root = document.documentElement;
  const set = (name: string, value: number): void => {
    root.style.setProperty(name, `${Math.max(0, value)}px`);
  };
  const safeTop = webApp.safeAreaInset?.top ?? 0;
  const safeBottom = webApp.safeAreaInset?.bottom ?? 0;
  const contentTop = webApp.contentSafeAreaInset?.top ?? 0;
  const contentBottom = webApp.contentSafeAreaInset?.bottom ?? 0;
  set("--tg-safe-top", safeTop);
  set("--tg-safe-bottom", safeBottom);
  set("--tg-content-top", contentTop);
  set("--tg-content-bottom", contentBottom);
  // Combined insets — the values layouts actually pad against.
  set("--tg-top", safeTop + contentTop);
  set("--tg-bottom", safeBottom + contentBottom);
}

export function openExternalLink(url: string): void {
  const webApp = getWebApp();
  if (webApp?.openLink) {
    webApp.openLink(url);
  } else {
    window.open(url, "_blank", "noopener");
  }
}

export function haptic(
  type: "success" | "error" | "light" = "light",
): void {
  const webApp = getWebApp();
  const feedback = webApp?.HapticFeedback;
  if (!feedback) return;
  if (type === "light") feedback.impactOccurred("light");
  else feedback.notificationOccurred(type);
}
