import type { Context } from "grammy";
import { config } from "../config.js";
import { BILDIRISHNOMA_INFO, TIL_INFO, kanalText } from "../text.js";

export async function handleBildirishnoma(ctx: Context): Promise<void> {
  await ctx.reply(BILDIRISHNOMA_INFO);
}

export async function handleKanal(ctx: Context): Promise<void> {
  await ctx.reply(kanalText(config.channelUrl));
}

export async function handleTil(ctx: Context): Promise<void> {
  await ctx.reply(TIL_INFO);
}
