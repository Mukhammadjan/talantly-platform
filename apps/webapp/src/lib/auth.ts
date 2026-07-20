import { getWebApp } from "./telegram";

// Sessiya ikki yo'l bilan olinadi:
//  1) Telegram ichida: initData → /api/auth → JWT (xotirada).
//  2) Brauzerda (web versiya): Login Widget → /api/auth/web → JWT
//     (localStorage'da saqlanadi — sahifa yangilansa ham qoladi).
let token: string | null = null;
let pending: Promise<string | null> | null = null;

const WEB_TOKEN_KEY = "talantly_web_token";

function localRole(): string | null {
  try {
    const v = window.localStorage.getItem("talantly_role");
    return v === "talant" || v === "izlovchi" ? v : null;
  } catch {
    return null;
  }
}

function readWebToken(): string | null {
  try {
    return window.localStorage.getItem(WEB_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Web (widget) kirishдан keyin token saqlanadi. */
export function setWebToken(t: string): void {
  token = t;
  try {
    window.localStorage.setItem(WEB_TOKEN_KEY, t);
  } catch {
    /* private mode — sessiya xotirada qoladi */
  }
}

export interface LoginResult {
  ok: boolean;
  status: number;
  preferredMode?: string | null;
}

/** Web: telefon + parol bilan kirish. Muvaffaqiyatda token saqlanadi. */
export async function loginWithPassword(
  phone: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data = (await res.json()) as {
      token?: string;
      preferredMode?: string | null;
    };
    if (data.token) setWebToken(data.token);
    return { ok: true, status: 200, preferredMode: data.preferredMode ?? null };
  } catch {
    return { ok: false, status: 0 };
  }
}

/** Web sessiyadan chiqish. */
export function clearWebToken(): void {
  token = null;
  try {
    window.localStorage.removeItem(WEB_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Telegram tashqarisida (web versiya) ekanini bildiradi. */
export function isWebMode(): boolean {
  return !getWebApp()?.initData;
}

async function login(): Promise<string | null> {
  const initData = getWebApp()?.initData;
  if (!initData) {
    // Brauzer: saqlangan web token bo'lsa o'shani ishlatamiz.
    return readWebToken();
  }
  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, role: localRole() }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    token = data.token ?? null;
    return token;
  } catch {
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  if (token) return token;
  if (!pending) {
    pending = login().finally(() => {
      pending = null;
    });
  }
  return pending;
}

/** Authorization header bilan fetch; token bo'lmasa oddiy fetch.
 *  Web token eskirgan bo'lsa (401) — tozalab, kirishga qaytariladi. */
export async function authedFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const t = await getToken();
  const headers = new Headers(init?.headers);
  if (t) headers.set("Authorization", `Bearer ${t}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 && isWebMode() && readWebToken()) {
    clearWebToken();
    try {
      window.location.href = "/kirish";
    } catch {
      /* SSR yo'q — client only */
    }
  }
  return res;
}

/** Real backend ishlatiladimi — TG initData yoki web token mavjud bo'lsa. */
export async function hasSession(): Promise<boolean> {
  return (await getToken()) !== null;
}
