import type { InterviewSlotInsert } from "@talantly/shared";
import * as interviewSlotsRepo from "../db/interviewSlotsRepo.js";

const MIN_OPEN_SLOTS = 12;
const DAYS_AHEAD = 7;
// Tashkent is UTC+5 with no DST.
const SLOT_HOURS_TASHKENT = [11, 15, 18];
const TASHKENT_OFFSET_HOURS = 5;

export async function ensureUpcomingSlots(): Promise<void> {
  const open = await interviewSlotsRepo.openFuture();
  const horizon = Date.now() + DAYS_AHEAD * 24 * 60 * 60 * 1000;
  const openInWindow = open.filter(
    (slot) => new Date(slot.starts_at).getTime() <= horizon,
  );
  if (openInWindow.length >= MIN_OPEN_SLOTS) {
    console.log(
      `Interview slots OK: ${openInWindow.length} open in next ${DAYS_AHEAD} days.`,
    );
    return;
  }

  const existing = new Set(
    open.map((slot) => new Date(slot.starts_at).getTime()),
  );
  const toInsert: InterviewSlotInsert[] = [];
  const today = new Date();

  for (
    let dayOffset = 1;
    dayOffset <= DAYS_AHEAD &&
    openInWindow.length + toInsert.length < MIN_OPEN_SLOTS;
    dayOffset++
  ) {
    for (const hour of SLOT_HOURS_TASHKENT) {
      const slot = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() + dayOffset,
          hour - TASHKENT_OFFSET_HOURS,
          0,
          0,
          0,
        ),
      );
      if (slot.getTime() <= Date.now()) continue;
      if (existing.has(slot.getTime())) continue;
      toInsert.push({ starts_at: slot.toISOString(), is_taken: false });
      if (openInWindow.length + toInsert.length >= MIN_OPEN_SLOTS) break;
    }
  }

  if (toInsert.length > 0) {
    const inserted = await interviewSlotsRepo.insertMany(toInsert);
    console.log(
      `Inserted ${inserted.length} interview slots (now ${openInWindow.length + inserted.length} open in window).`,
    );
  }
}
