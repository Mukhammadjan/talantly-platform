export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
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

/** Signals readiness and harmonizes chrome colors with the brand background. */
export function initTelegramUi(): TelegramWebApp | null {
  const webApp = getWebApp();
  if (!webApp) return null;
  webApp.ready();
  webApp.expand();
  try {
    webApp.setBackgroundColor(BRAND_BG);
    webApp.setHeaderColor(BRAND_BG);
  } catch {
    // Older Telegram clients do not support color overrides — brand CSS still applies.
  }
  const theme = webApp.themeParams;
  const root = document.documentElement;
  if (theme.text_color) root.style.setProperty("--tg-text", theme.text_color);
  if (theme.hint_color) root.style.setProperty("--tg-hint", theme.hint_color);

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

function applySafeArea(webApp: TelegramWebApp): void {
  const root = document.documentElement;
  const set = (name: string, value: number | undefined): void => {
    root.style.setProperty(name, `${Math.max(0, value ?? 0)}px`);
  };
  set("--tg-safe-top", webApp.safeAreaInset?.top);
  set("--tg-safe-bottom", webApp.safeAreaInset?.bottom);
  set("--tg-content-top", webApp.contentSafeAreaInset?.top);
  set("--tg-content-bottom", webApp.contentSafeAreaInset?.bottom);
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
