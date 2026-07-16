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

export const config = {
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
  adminTgId: optional("ADMIN_TG_ID"),
  adminUsername: optional("ADMIN_USERNAME"),
  paymentCardNumber: optional("PAYMENT_CARD_NUMBER"),
  paymentCardOwner: optional("PAYMENT_CARD_OWNER"),
  webappUrl: optional("WEBAPP_URL"),
  channelUrl: optional("CHANNEL_URL"),
} as const;

export type Config = typeof config;
