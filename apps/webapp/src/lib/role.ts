import { getWebApp } from "./telegram";

// Tanlangan rol Telegram CloudStorage (qurilmalar aro) + localStorage'da
// saqlanadi — app har safar so'ramaydi.
export type AppRole = "talant" | "izlovchi";

const KEY = "talantly_role";

function parse(v: string | null | undefined): AppRole | null {
  return v === "talant" || v === "izlovchi" ? v : null;
}

export function saveRole(role: AppRole): void {
  try {
    window.localStorage.setItem(KEY, role);
  } catch {
    /* private mode */
  }
  try {
    getWebApp()?.CloudStorage?.setItem(KEY, role);
  } catch {
    /* eski Telegram versiyasi */
  }
}

export function getSavedRole(): Promise<AppRole | null> {
  return new Promise((resolve) => {
    let local: AppRole | null = null;
    try {
      local = parse(window.localStorage.getItem(KEY));
    } catch {
      /* private mode */
    }

    const cloud = getWebApp()?.CloudStorage;
    if (!cloud) {
      resolve(local);
      return;
    }

    let done = false;
    const finish = (v: AppRole | null): void => {
      if (done) return;
      done = true;
      resolve(v);
    };

    try {
      cloud.getItem(KEY, (_err, value) => {
        finish(parse(value) ?? local);
      });
    } catch {
      finish(local);
    }
    // Cloud javob bermasa — lokalga tushamiz.
    window.setTimeout(() => finish(local), 1200);
  });
}
