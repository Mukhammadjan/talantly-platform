import type { Context } from "grammy";
import { config } from "../config.js";
import * as statsRepo from "../db/statsRepo.js";
import { ADMIN_DENIED, adminStats } from "../text.js";

function isAdmin(tgId: number | undefined): boolean {
  return Boolean(config.adminTgId) && String(tgId) === String(config.adminTgId);
}

export async function handleAdmin(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;
  if (!isAdmin(from.id)) {
    await ctx.reply(ADMIN_DENIED);
    return;
  }

  const counts = await statsRepo.countByStatus();
  await ctx.reply(adminStats(counts));
}
