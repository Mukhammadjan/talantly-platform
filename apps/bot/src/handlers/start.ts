import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { InputFile, type CommandContext, type Context } from "grammy";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { logger } from "../logger.js";
import {
  mainMenuKeyboard,
  registerKeyboard,
  roleChoiceKeyboard,
} from "../keyboards.js";
import {
  MINI_APP_COMING_SOON,
  ROLE_PROMPT,
  WELCOME_ROADMAP,
  deepLinkGreeting,
  returningGreeting,
  startCaption,
} from "../text.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BANNER_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../assets/welcome.png",
);
const BANNER_OK = existsSync(BANNER_PATH);

/** Banner rasm + sarlavha + doimiy menyu. Rasm bo'lmasa oddiy matnga tushadi. */
async function sendWelcome(
  ctx: CommandContext<Context>,
  caption: string,
): Promise<void> {
  const reply_markup = mainMenuKeyboard();
  if (BANNER_OK) {
    try {
      await ctx.replyWithPhoto(new InputFile(BANNER_PATH), {
        caption,
        reply_markup,
      });
      return;
    } catch (err) {
      logger.error({ err }, "welcome banner send failed, falling back to text");
    }
  }
  await ctx.reply(caption, { reply_markup });
}

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

/** Yangi foydalanuvchi: rol tanlash — tugma ilovani ?role= bilan ochadi. */
async function sendRolePrompt(ctx: CommandContext<Context>): Promise<void> {
  const keyboard = roleChoiceKeyboard();
  if (keyboard) {
    await ctx.reply(ROLE_PROMPT, { reply_markup: keyboard });
  } else {
    await ctx.reply(`${ROLE_PROMPT}\n\n${MINI_APP_COMING_SOON}`);
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
        await sendWelcome(
          ctx,
          deepLinkGreeting(talent.full_name ?? from.first_name),
        );
        await sendRegisterPrompt(ctx);
        return;
      }
    }
  }

  const talent = await talentsRepo.findByUserId(user.id);
  if (talent && talent.status !== "yangi") {
    await sendWelcome(
      ctx,
      returningGreeting({
        fullName: talent.full_name,
        firstName: from.first_name,
        status: talent.status,
      }),
    );
    return;
  }

  await sendWelcome(ctx, startCaption(from.first_name));
  await sendRolePrompt(ctx);
}
