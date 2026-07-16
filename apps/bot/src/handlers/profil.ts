import type { Context } from "grammy";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { profileKeyboard, registerKeyboard } from "../keyboards.js";
import {
  MINI_APP_COMING_SOON,
  PROFILE_NOT_REGISTERED,
  PROFILE_REGISTER_HINT,
  profileSummary,
} from "../text.js";

export async function handleProfil(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const user = await usersRepo.findByTgId(from.id);
  const talent = user ? await talentsRepo.findByUserId(user.id) : null;

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

  const keyboard = profileKeyboard();
  await ctx.reply(
    profileSummary({
      fullName: talent.full_name,
      direction: talent.direction,
      status: talent.status,
    }),
    keyboard ? { reply_markup: keyboard } : undefined,
  );
}
