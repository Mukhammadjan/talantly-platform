import { Bot, type CommandContext, type Context } from "grammy";
import { config } from "./config.js";
import { startCvPdfWorker, stopCvPdfBrowser } from "./cv/pdfWorker.js";
import {
  handleBaholash,
  handleBaholashCallback,
  handleBaholashText,
} from "./handlers/baholash.js";
import { handleProfil } from "./handlers/profil.js";
import { handleStart } from "./handlers/start.js";
import { handleYordam } from "./handlers/yordam.js";
import { logger } from "./logger.js";
import { GENERIC_ERROR } from "./text.js";
import { ensureUpcomingSlots } from "./workers/ensureSlots.js";
import { startReminderWorker } from "./workers/reminderWorker.js";

type CommandHandler = (ctx: CommandContext<Context>) => Promise<void>;

function safe(handler: CommandHandler): CommandHandler {
  return async (ctx) => {
    try {
      await handler(ctx);
    } catch (err) {
      logger.error({ err }, "Handler error");
      try {
        await ctx.reply(GENERIC_ERROR);
      } catch (replyErr) {
        logger.error({ err: replyErr }, "Failed to send error reply");
      }
    }
  };
}

async function main(): Promise<void> {
  const bot = new Bot(config.telegramBotToken);

  bot.command("start", safe(handleStart));
  bot.command("profil", safe(handleProfil));
  bot.command("yordam", safe(handleYordam));
  bot.command("baholash", safe(handleBaholash));

  bot.callbackQuery(/^bhl:/, async (ctx) => {
    try {
      await handleBaholashCallback(ctx);
    } catch (err) {
      logger.error({ err }, "baholash callback error");
    }
  });

  bot.on("message:text", async (ctx) => {
    try {
      await handleBaholashText(ctx);
    } catch (err) {
      logger.error({ err }, "baholash text error");
    }
  });

  bot.catch((err) => {
    logger.error({ err }, "Bot error");
  });

  await bot.api.setMyCommands([
    { command: "start", description: "Botni ishga tushirish" },
    { command: "profil", description: "Profil holati" },
    { command: "yordam", description: "Yordam va bog'lanish" },
  ]);
  if (config.adminTgId) {
    await bot.api.setMyCommands(
      [
        { command: "start", description: "Botni ishga tushirish" },
        { command: "profil", description: "Profil holati" },
        { command: "yordam", description: "Yordam va bog'lanish" },
        { command: "baholash", description: "Suhbatlarni baholash (moderator)" },
      ],
      { scope: { type: "chat", chat_id: Number(config.adminTgId) } },
    );
  }

  const stopCvPdfWorker = startCvPdfWorker(bot);
  const stopReminderWorker = startReminderWorker(bot);
  ensureUpcomingSlots().catch((err) => {
    logger.error({ err }, "ensureUpcomingSlots failed");
  });

  let stopping = false;
  const stop = (signal: string): void => {
    if (stopping) return;
    stopping = true;
    logger.info({ signal }, "Shutting down bot...");
    stopCvPdfWorker();
    stopReminderWorker();
    void stopCvPdfBrowser()
      .catch((err) => logger.error({ err }, "Browser close failed"))
      .then(() => bot.stop());
  };
  process.once("SIGINT", () => stop("SIGINT"));
  process.once("SIGTERM", () => stop("SIGTERM"));

  logger.info("Starting bot (long polling)...");
  await bot.start({
    onStart: (info) => {
      logger.info(`Bot @${info.username} is running.`);
    },
  });
  logger.info("Bot stopped. Bye.");
}

main().catch((err: unknown) => {
  logger.fatal({ err }, "Fatal");
  process.exit(1);
});
