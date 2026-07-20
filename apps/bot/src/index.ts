import { createHmac } from "node:crypto";
import http from "node:http";
import { Bot, webhookCallback, type CommandContext, type Context } from "grammy";
import { config } from "./config.js";
import { startCvPdfWorker, stopCvPdfBrowser } from "./cv/pdfWorker.js";
import { handleAdmin } from "./handlers/admin.js";
import {
  handleBaholash,
  handleBaholashCallback,
  handleBaholashText,
} from "./handlers/baholash.js";
import { handleHolat } from "./handlers/holat.js";
import { handleMenuText } from "./handlers/menu.js";
import {
  handleContact,
  handleParol,
  handleParolText,
  handleRoleChoice,
} from "./handlers/parol.js";
import { handleProfil } from "./handlers/profil.js";
import { handleRoyxat, handleStart } from "./handlers/start.js";
import { handleSuhbat, handleSuhbatCallback } from "./handlers/suhbat.js";
import { handlePaymentPhoto, handleTolov } from "./handlers/tolov.js";
import {
  handlePayCallback,
  handleTolovlar,
  handleTolovlarCallback,
} from "./handlers/tolovlar.js";
import { handleYordam } from "./handlers/yordam.js";
import { logger } from "./logger.js";
import { GENERIC_ERROR } from "./text.js";
import { ensureUpcomingSlots } from "./workers/ensureSlots.js";
import { startPushWorker } from "./workers/pushWorker.js";
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
  bot.command("holat", safe(handleHolat));
  bot.command("suhbat", safe(handleSuhbat));
  bot.command("tolov", safe(handleTolov));
  bot.command("royxat", safe(handleRoyxat));
  bot.command("parol", safe(handleParol));
  bot.command("yordam", safe(handleYordam));

  // Ro'yxat: rol tanlash → raqam so'raladi (parol SO'RALMAYDI).
  bot.callbackQuery(/^role:(talant|izlovchi)$/, async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      const role = ctx.match?.[1] === "izlovchi" ? "izlovchi" : "talant";
      await handleRoleChoice(ctx, role);
    } catch (err) {
      logger.error({ err }, "role callback error");
    }
  });

  // «🔑 Login-parol olish» tugmasi — ixtiyoriy parol oqimini boshlaydi.
  bot.callbackQuery("pwd:start", async (ctx) => {
    try {
      await ctx.answerCallbackQuery();
      await handleParol(ctx);
    } catch (err) {
      logger.error({ err }, "pwd:start callback error");
    }
  });
  bot.command("baholash", safe(handleBaholash));
  bot.command("admin", safe(handleAdmin));
  bot.command("tolovlar", safe(handleTolovlar));

  bot.callbackQuery(/^bhl:/, async (ctx) => {
    try {
      await handleBaholashCallback(ctx);
    } catch (err) {
      logger.error({ err }, "baholash callback error");
    }
  });

  bot.callbackQuery(/^tlv:/, async (ctx) => {
    try {
      await handleTolovlarCallback(ctx);
    } catch (err) {
      logger.error({ err }, "tolovlar callback error");
    }
  });

  // Mini App'dan kelgan AI CV to'lovlari (payments) tasdiqlash oqimi.
  bot.callbackQuery(/^pay:/, async (ctx) => {
    try {
      await handlePayCallback(ctx);
    } catch (err) {
      logger.error({ err }, "payment callback error");
    }
  });

  bot.callbackQuery(/^sbt:/, async (ctx) => {
    try {
      await handleSuhbatCallback(ctx);
    } catch (err) {
      logger.error({ err }, "suhbat callback error");
      try {
        await ctx.answerCallbackQuery({ text: GENERIC_ERROR });
      } catch {
        /* ignore */
      }
    }
  });

  // To'lov cheki (rasm) — to'lovgacha bo'lgan talantlar uchun.
  bot.on("message:photo", async (ctx) => {
    try {
      await handlePaymentPhoto(ctx);
    } catch (err) {
      logger.error({ err }, "payment photo error");
    }
  });

  // Kontakt — parol o'rnatish oqimida telefon raqami.
  bot.on("message:contact", async (ctx) => {
    try {
      await handleContact(ctx);
    } catch (err) {
      logger.error({ err }, "contact handler error");
    }
  });

  // Matn: baholash sessiyasi → parol oqimi → doimiy menyu tugmalari.
  bot.on("message:text", async (ctx) => {
    try {
      if (await handleBaholashText(ctx)) return;
      if (await handleParolText(ctx)) return;
      await handleMenuText(ctx);
    } catch (err) {
      logger.error({ err }, "text handler error");
    }
  });

  bot.catch((err) => {
    logger.error({ err }, "Bot error");
  });

  const publicCommands = [
    { command: "start", description: "Botni ishga tushirish" },
    { command: "royxat", description: "Ro'yxatdan o'tish" },
    { command: "holat", description: "Tekshiruv holatim va yo'lim" },
    { command: "profil", description: "Profilim" },
    { command: "suhbat", description: "Suhbat vaqtini band qilish" },
    { command: "tolov", description: "AI CV uchun to'lov" },
    { command: "parol", description: "Login-parol olish (web uchun)" },
    { command: "yordam", description: "Yordam va bog'lanish" },
  ];
  await bot.api.setMyCommands(publicCommands);
  if (config.adminTgId) {
    await bot.api.setMyCommands(
      [
        ...publicCommands,
        { command: "baholash", description: "Suhbatlarni baholash (moderator)" },
        { command: "tolovlar", description: "To'lovlarni tasdiqlash (moderator)" },
        { command: "admin", description: "Statistika (admin)" },
      ],
      { scope: { type: "chat", chat_id: Number(config.adminTgId) } },
    );
  }

  const stopCvPdfWorker = startCvPdfWorker(bot);
  const stopReminderWorker = startReminderWorker(bot);
  const stopPushWorker = startPushWorker(bot);
  ensureUpcomingSlots().catch((err) => {
    logger.error({ err }, "ensureUpcomingSlots failed");
  });

  // Railway/prod: webhook; lokal dev: long polling.
  const webhookDomain =
    process.env.WEBHOOK_URL?.replace(/\/+$/, "") ??
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : null);
  let server: http.Server | null = null;

  let stopping = false;
  const stop = (signal: string): void => {
    if (stopping) return;
    stopping = true;
    logger.info({ signal }, "Shutting down bot...");
    stopCvPdfWorker();
    stopReminderWorker();
    stopPushWorker();
    server?.close();
    void stopCvPdfBrowser()
      .catch((err) => logger.error({ err }, "Browser close failed"))
      .then(() => (webhookDomain ? process.exit(0) : bot.stop()));
  };
  process.once("SIGINT", () => stop("SIGINT"));
  process.once("SIGTERM", () => stop("SIGTERM"));

  // /healthz ikkala rejimda ham ochiq: Railway healthcheck long polling'da
  // ham javob olishi kerak, aks holda deploy "unhealthy" bo'lib qayta-qayta
  // ishga tushadi.
  const path = "/telegram-webhook";
  const secretToken = createHmac("sha256", config.telegramBotToken)
    .update("webhook")
    .digest("hex")
    .slice(0, 64);
  const handler = webhookDomain
    ? webhookCallback(bot, "http", { secretToken })
    : null;
  if (webhookDomain) await bot.init();

  server = http.createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    if (handler && req.method === "POST" && req.url === path) {
      void handler(req, res).catch((err) => {
        logger.error({ err }, "webhook handler error");
        if (!res.headersSent) res.writeHead(200);
        res.end();
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const port = Number(process.env.PORT ?? 8080);
  await new Promise<void>((resolve) => {
    // Lokalda port band bo'lsa bot to'xtamaydi — healthcheck faqat prod'da kerak.
    server?.once("error", (err) => {
      logger.warn({ err, port }, "healthcheck server not started");
      server = null;
      resolve();
    });
    server?.listen(port, resolve);
  });

  if (webhookDomain) {
    await bot.api.setWebhook(`${webhookDomain}${path}`, {
      secret_token: secretToken,
    });
    logger.info(`Bot webhook rejimida: ${webhookDomain}${path} (port ${port})`);
  } else {
    // Polling oldidan eski webhook olib tashlanadi (409 bo'lmasin).
    await bot.api.deleteWebhook().catch(() => undefined);
    logger.info("Starting bot (long polling)...");
    await bot.start({
      onStart: (info) => {
        logger.info(`Bot @${info.username} is running.`);
      },
    });
    logger.info("Bot stopped. Bye.");
  }
}

main().catch((err: unknown) => {
  logger.fatal({ err }, "Fatal");
  process.exit(1);
});
