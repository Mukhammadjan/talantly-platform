import { getWebApp } from "./telegram";

// Sessiya: initData → /api/auth → JWT (xotirada; sahifa yangilansa qayta olinadi).
let token: string | null = null;
let pending: Promise<string | null> | null = null;

function localRole(): string | null {
  try {
    const v = window.localStorage.getItem("talantly_role");
    return v === "talant" || v === "izlovchi" ? v : null;
  } catch {
    return null;
  }
}

async function login(): Promise<string | null> {
  const initData = getWebApp()?.initData;
  if (!initData) return null; // Telegram tashqarisida — real API yo'q
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

/** Authorization header bilan fetch; token bo'lmasa oddiy fetch. */
export async function authedFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  const t = await getToken();
  const headers = new Headers(init?.headers);
  if (t) headers.set("Authorization", `Bearer ${t}`);
  return fetch(input, { ...init, headers });
}

/** Real backend ishlatiladimi — Telegram ichida va token olingan bo'lsa. */
export async function hasSession(): Promise<boolean> {
  return (await getToken()) !== null;
}
