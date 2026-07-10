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

// Lazy getters: route modules are evaluated during `next build`, where secrets
// may be absent — env must only be read at request time.
export const serverEnv = {
  get botToken(): string {
    return required("TELEGRAM_BOT_TOKEN");
  },
  get supabaseUrl(): string {
    return required("SUPABASE_URL");
  },
  get supabaseServiceRoleKey(): string {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get jwtSecret(): string {
    return required("WEBAPP_JWT_SECRET");
  },
  get adminTgId(): string | undefined {
    return optional("ADMIN_TG_ID");
  },
  get paymentCardNumber(): string | undefined {
    return optional("PAYMENT_CARD_NUMBER");
  },
  get paymentCardOwner(): string | undefined {
    return optional("PAYMENT_CARD_OWNER");
  },
  get paymentEnabled(): boolean {
    return optional("PAYMENT_ENABLED") === "true";
  },
};
