import { config } from "../config.js";
import { findByTgId, upsertByTgId } from "../db/usersRepo.js";

async function main(): Promise<void> {
  const raw = process.argv[2] ?? config.adminTgId;
  if (!raw) {
    throw new Error(
      "Provide a Telegram id: `tsx src/scripts/testUserUpsert.ts <tg_id>` or set ADMIN_TG_ID in .env",
    );
  }
  const tgId = Number(raw);
  if (!Number.isFinite(tgId) || !Number.isInteger(tgId)) {
    throw new Error(`Invalid tg_id: ${raw}`);
  }

  console.log(`Upserting user by tg_id=${tgId}...`);
  const upserted = await upsertByTgId(tgId);
  console.log("upsertByTgId returned:", upserted);

  const fetched = await findByTgId(tgId);
  console.log("findByTgId returned:", fetched);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Fatal:", message);
  process.exit(1);
});
