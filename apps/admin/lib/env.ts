import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Admin panel v2 (talantly-v2) bazasiga ulanadi — bot/webapp bilan bir xil.
// v1 (SUPABASE_URL) LEGACY — bu yerda ISHLATILMAYDI.
export const serverEnv = {
  get supabaseUrl(): string {
    return required("SUPABASE_V2_URL");
  },
  get supabaseServiceRoleKey(): string {
    return required("SUPABASE_V2_SERVICE_ROLE_KEY");
  },
  /** JWT sessiya siri — webapp bilan bir xil (rol DB'da tekshiriladi). */
  get jwtSecret(): string {
    return required("WEBAPP_JWT_SECRET");
  },
};
