import type { Bot } from "grammy";
import * as interviewsRepo from "../db/interviewsRepo.js";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { logger } from "../logger.js";
import { interviewReminder } from "../text.js";

const POLL_INTERVAL_MS = 60_000;
// Ikki eslatma oynasi (C12): 1 soat oldin va 24 soat oldin.
const WINDOWS = [
  { key: "reminderSentFor", fromMin: 55, toMin: 65, label: "1h" },
  { key: "reminder24SentFor", fromMin: 24 * 60 - 5, toMin: 24 * 60 + 5, label: "24h" },
] as const;

export function startReminderWorker(bot: Bot): () => void {
  let running = false;

  const tick = async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      const now = Date.now();
      for (const win of WINDOWS) {
        const fromIso = new Date(now + win.fromMin * 60_000).toISOString();
        const toIso = new Date(now + win.toMin * 60_000).toISOString();
        const upcoming = await interviewsRepo.findScheduledBetween(
          fromIso,
          toIso,
        );

        for (const interview of upcoming) {
          if (!interview.talent_id || !interview.scheduled_at) continue;
          try {
            const talent = await talentsRepo.findById(interview.talent_id);
            if (!talent) continue;

            // Dedup flag talents.bot_state'da — restart takror yubormaydi.
            const state = talent.bot_state ?? {};
            const data = (state.data ?? {}) as Record<string, unknown>;
            if (data[win.key] === interview.id) continue;

            const user = talent.user_id
              ? await usersRepo.findById(talent.user_id)
              : null;
            if (!user?.tg_id) continue;

            await bot.api.sendMessage(
              user.tg_id,
              win.label === "24h"
                ? `📅 Eslatma: suhbatingiz ertaga — ${interviewReminder(interview.scheduled_at).replace("⏰ Eslatma!\n\n", "")}`
                : interviewReminder(interview.scheduled_at),
            );
            await talentsRepo.updateBotState(talent.id, {
              ...state,
              data: { ...data, [win.key]: interview.id },
            });
            logger.info(
              `Interview ${win.label} reminder sent for talent ${talent.id} (interview ${interview.id})`,
            );
          } catch (err) {
            logger.error(
              { err },
              `Reminder failed for interview ${interview.id}`,
            );
          }
        }
      }
    } catch (err) {
      logger.error({ err }, "Reminder worker tick failed");
    } finally {
      running = false;
    }
  };

  const timer = setInterval(() => void tick(), POLL_INTERVAL_MS);
  void tick();
  logger.info(
    `Interview reminder worker started (cron every ${POLL_INTERVAL_MS / 1000}s).`,
  );
  return () => clearInterval(timer);
}
