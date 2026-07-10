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

const BRAND_CREAM = "#FBF6F0";

/** Signals readiness and harmonizes chrome colors with the brand background. */
export function initTelegramUi(): TelegramWebApp | null {
  const webApp = getWebApp();
  if (!webApp) return null;
  webApp.ready();
  webApp.expand();
  try {
    webApp.setBackgroundColor(BRAND_CREAM);
    webApp.setHeaderColor(BRAND_CREAM);
  } catch {
    // Older Telegram clients do not support color overrides — brand CSS still applies.
  }
  const theme = webApp.themeParams;
  const root = document.documentElement;
  if (theme.text_color) root.style.setProperty("--tg-text", theme.text_color);
  if (theme.hint_color) root.style.setProperty("--tg-hint", theme.hint_color);
  return webApp;
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
