import type { CommandContext, Context } from "grammy";
import { config } from "../config.js";
import { helpText } from "../text.js";

export async function handleYordam(
  ctx: CommandContext<Context>,
): Promise<void> {
  await ctx.reply(helpText(config.adminUsername));
}
