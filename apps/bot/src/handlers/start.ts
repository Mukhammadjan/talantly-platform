import type { CommandContext, Context } from "grammy";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { profileKeyboard, registerKeyboard } from "../keyboards.js";
import {
  MINI_APP_COMING_SOON,
  WELCOME_ROADMAP,
  deepLinkGreeting,
  returningGreeting,
  welcomeIntro,
} from "../text.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function sendRegisterPrompt(
  ctx: CommandContext<Context>,
): Promise<void> {
  const keyboard = registerKeyboard();
  if (keyboard) {
    await ctx.reply(WELCOME_ROADMAP, { reply_markup: keyboard });
  } else {
    await ctx.reply(`${WELCOME_ROADMAP}\n\n${MINI_APP_COMING_SOON}`);
  }
}

export async function handleStart(
  ctx: CommandContext<Context>,
): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const user = await usersRepo.upsertByTgId(from.id);

  const payload = ctx.match.trim();
  if (payload.startsWith("web_")) {
    const talentId = payload.slice("web_".length);
    if (UUID_RE.test(talentId)) {
      const talent = await talentsRepo.findById(talentId);
      if (talent) {
        if (!talent.user_id) {
          await talentsRepo.linkUserId(talent.id, user.id);
        }
        await ctx.reply(deepLinkGreeting(talent.full_name ?? from.first_name));
        await sendRegisterPrompt(ctx);
        return;
      }
    }
  }

  const talent = await talentsRepo.findByUserId(user.id);
  if (talent && talent.status !== "yangi") {
    const keyboard = profileKeyboard();
    await ctx.reply(
      returningGreeting({
        fullName: talent.full_name,
        firstName: from.first_name,
        status: talent.status,
      }),
      keyboard ? { reply_markup: keyboard } : undefined,
    );
    return;
  }

  await ctx.reply(welcomeIntro(from.first_name));
  await sendRegisterPrompt(ctx);
}
