import type { Context } from "grammy";
import { registerKeyboard } from "../keyboards.js";
import {
  MINI_APP_COMING_SOON,
  PROFILE_NOT_REGISTERED,
  PROFILE_REGISTER_HINT,
  holatText,
} from "../text.js";
import { loadTalentByTgId } from "./util.js";

export async function handleHolat(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const talent = await loadTalentByTgId(from.id);
  if (!talent) {
    const keyboard = registerKeyboard();
    if (keyboard) {
      await ctx.reply(`${PROFILE_NOT_REGISTERED} ${PROFILE_REGISTER_HINT}`, {
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(`${PROFILE_NOT_REGISTERED} ${MINI_APP_COMING_SOON}`);
    }
    return;
  }

  await ctx.reply(
    holatText({ fullName: talent.full_name, status: talent.status }),
  );
}
