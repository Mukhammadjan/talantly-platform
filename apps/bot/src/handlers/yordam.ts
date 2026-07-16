import type { Context } from "grammy";
import { config } from "../config.js";
import { helpText } from "../text.js";

export async function handleYordam(ctx: Context): Promise<void> {
  await ctx.reply(helpText(config.adminUsername));
}
