import type { Bot } from "grammy";
import * as interviewsRepo from "../db/interviewsRepo.js";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";
import { logger } from "../logger.js";
import { interviewReminder } from "../text.js";

const POLL_INTERVAL_MS = 60_000;
const WINDOW_FROM_MIN = 55;
const WINDOW_TO_MIN = 65;

export function startReminderWorker(bot: Bot): () => void {
  let running = false;

  const tick = async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      const now = Date.now();
      const fromIso = new Date(now + WINDOW_FROM_MIN * 60_000).toISOString();
      const toIso = new Date(now + WINDOW_TO_MIN * 60_000).toISOString();
      const upcoming = await interviewsRepo.findScheduledBetween(
        fromIso,
        toIso,
      );

      for (const interview of upcoming) {
        if (!interview.talent_id || !interview.scheduled_at) continue;
        try {
          const talent = await talentsRepo.findById(interview.talent_id);
          if (!talent) continue;

          // Dedup flag lives in talents.bot_state so a bot restart never
          // causes a duplicate reminder (guardrail: state survives restarts).
          const state = talent.bot_state ?? {};
          const data = (state.data ?? {}) as Record<string, unknown>;
          if (data["reminderSentFor"] === interview.id) continue;

          const user = talent.user_id
            ? await usersRepo.findById(talent.user_id)
            : null;
          if (!user?.tg_id) continue;

          await bot.api.sendMessage(
            user.tg_id,
            interviewReminder(interview.scheduled_at),
          );
          await talentsRepo.updateBotState(talent.id, {
            ...state,
            data: { ...data, reminderSentFor: interview.id },
          });
          logger.info(
            `Interview reminder sent for talent ${talent.id} (interview ${interview.id})`,
          );
        } catch (err) {
          logger.error(
            { err },
            `Reminder failed for interview ${interview.id}`,
          );
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
