import { settingsRepo, type TalantlyClient } from "@talantly/shared";

/**
 * Global visibility switch for demo talents/companies, read from the `settings`
 * table on every request (never cached, never hardcoded). Fail-open to `true`
 * so a missing key can never accidentally empty the app; admins flip it to
 * "false" to hide seeded demo data and show only real users.
 */
export async function showDemoData(client: TalantlyClient): Promise<boolean> {
  return settingsRepo.getBool(client, "show_demo_data", true);
}
