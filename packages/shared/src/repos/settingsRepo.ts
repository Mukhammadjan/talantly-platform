import type { TalantlyClient } from "../db/client.js";
import type { SettingRow } from "../types.js";

function fail(op: string, message: string, code?: string): never {
  throw new Error(
    `settingsRepo.${op} failed: ${message} (code=${code ?? "unknown"})`,
  );
}

/** Reads a single settings value, or null when the key is absent. */
export async function get(
  client: TalantlyClient,
  key: string,
): Promise<string | null> {
  const { data, error } = await client
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) fail(`get(${key})`, error.message, error.code);
  return (data as Pick<SettingRow, "value"> | null)?.value ?? null;
}

/**
 * Reads a boolean flag. Values are stored as TEXT — only the exact string
 * "true" (case-insensitive) counts as true; a missing key returns `fallback`.
 */
export async function getBool(
  client: TalantlyClient,
  key: string,
  fallback: boolean,
): Promise<boolean> {
  const raw = await get(client, key);
  if (raw === null) return fallback;
  return raw.trim().toLowerCase() === "true";
}
