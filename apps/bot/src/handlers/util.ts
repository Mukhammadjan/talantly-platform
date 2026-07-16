import type { TalentRow } from "@talantly/shared";
import * as talentsRepo from "../db/talentsRepo.js";
import * as usersRepo from "../db/usersRepo.js";

/** Telegram foydalanuvchisi bo'yicha talent yozuvini yuklaydi (bo'lmasa null). */
export async function loadTalentByTgId(tgId: number): Promise<TalentRow | null> {
  const user = await usersRepo.findByTgId(tgId);
  if (!user) return null;
  return talentsRepo.findByUserId(user.id);
}
