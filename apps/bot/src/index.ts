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
import { GENERIC_ERROR } from "./text.js";
import { ensureUpcomingSlots } from "./workers/ensureSlots.js";
import { startReminderWorker } from "./workers/reminderWorker.js";

type CommandHandler = (ctx: CommandContext<Context>) => Promise<void>;

function safe(handler: CommandHandler): CommandHandler {
  return async (ctx) => {
    try {
      await handler(ctx);
    } catch (err) {
      console.error("Handler error:", err);
      try {
        await ctx.reply(GENERIC_ERROR);
      } catch (replyErr) {
        console.error("Failed to send error reply:", replyErr);
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
      console.error("baholash callback error:", err);
    }
  });

  bot.on("message:text", async (ctx) => {
    try {
      await handleBaholashText(ctx);
    } catch (err) {
      console.error("baholash text error:", err);
    }
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
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

  const stop = (): void => {
    console.log("Stopping bot...");
    void stopCvPdfBrowser();
    void bot.stop();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);

  startCvPdfWorker(bot);
  startReminderWorker(bot);
  ensureUpcomingSlots().catch((err) => {
    console.error("ensureUpcomingSlots failed:", err);
  });

  console.log("Starting bot (long polling)...");
  await bot.start({
    onStart: (info) => {
      console.log(`Bot @${info.username} is running.`);
    },
  });
}

main().catch((err: unknown) => {
  console.error("Fatal:", err);
  process.exit(1);
});
