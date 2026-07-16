import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

function findEnvFile(startDir: string): string | undefined {
  let dir = startDir;
  for (;;) {
    const candidate = resolve(dir, ".env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
}

const here = dirname(fileURLToPath(import.meta.url));
const envPath = findEnvFile(here);
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

/** Birinchi mavjud env: v2 kalitlar ustuvor, v1 zaxira. */
function firstOf(...names: string[]): string {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim() !== "") return v;
  }
  throw new Error(`Missing required env var: ${names.join(" or ")}`);
}

export const config = {
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  // v2 Supabase ustuvor (talantly-v2); eski nomlar zaxira sifatida qoladi.
  supabaseUrl: firstOf("SUPABASE_V2_URL", "SUPABASE_URL"),
  supabaseAnonKey: firstOf("SUPABASE_V2_ANON_KEY", "SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: firstOf(
    "SUPABASE_V2_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ),
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
  adminTgId: optional("ADMIN_TG_ID"),
  adminUsername: optional("ADMIN_USERNAME"),
  paymentCardNumber: optional("PAYMENT_CARD_NUMBER"),
  paymentCardOwner: optional("PAYMENT_CARD_OWNER"),
  webappUrl: optional("WEBAPP_URL"),
  channelUrl: optional("CHANNEL_URL"),
} as const;

export type Config = typeof config;
