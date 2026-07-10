import type { AuthResponse } from "./apiTypes";
import { getWebApp } from "./telegram";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let token: string | null = null;
let authPromise: Promise<AuthResponse> | null = null;

async function requestAuth(): Promise<AuthResponse> {
  const initData = getWebApp()?.initData ?? "";
  const response = await fetch("/api/auth/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData }),
  });
  const json: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (json as { error?: string }).error ?? "Avtorizatsiya amalga oshmadi.";
    throw new ApiError(response.status, message);
  }
  const auth = json as AuthResponse;
  token = auth.token;
  return auth;
}

export function authenticate(force = false): Promise<AuthResponse> {
  if (!authPromise || force) {
    authPromise = requestAuth().catch((err: unknown) => {
      authPromise = null;
      throw err;
    });
  }
  return authPromise;
}

export function isInsideTelegram(): boolean {
  return Boolean(getWebApp()?.initData);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!token) await authenticate();

  const doFetch = (): Promise<Response> =>
    fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token ?? ""}`,
      },
    });

  let response = await doFetch();
  if (response.status === 401) {
    await authenticate(true);
    response = await doFetch();
  }

  const json: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (json as { error?: string }).error ?? "Xatolik yuz berdi.";
    throw new ApiError(response.status, message);
  }
  return json as T;
}
