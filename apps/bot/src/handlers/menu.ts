import type { Context } from "grammy";
import { MENU } from "../text.js";
import { handleHolat } from "./holat.js";
import { handleBildirishnoma, handleKanal, handleTil } from "./info.js";
import { handleParol } from "./parol.js";
import { handleProfil } from "./profil.js";
import { handleSuhbat } from "./suhbat.js";
import { handleTolov } from "./tolov.js";
import { handleYordam } from "./yordam.js";

/**
 * Doimiy menyu tugmalari matn sifatida keladi — mos handlerga yo'naltiradi.
 * Tugma tanilsa true qaytaradi.
 */
export async function handleMenuText(ctx: Context): Promise<boolean> {
  const text = ctx.message?.text?.trim();
  if (!text) return false;

  switch (text) {
    case MENU.holat:
      await handleHolat(ctx);
      return true;
    case MENU.profil:
      await handleProfil(ctx);
      return true;
    case MENU.suhbat:
      await handleSuhbat(ctx);
      return true;
    case MENU.tolov:
      await handleTolov(ctx);
      return true;
    case MENU.parol:
      await handleParol(ctx);
      return true;
    case MENU.bildirishnoma:
      await handleBildirishnoma(ctx);
      return true;
    case MENU.kanal:
      await handleKanal(ctx);
      return true;
    case MENU.til:
      await handleTil(ctx);
      return true;
    case MENU.yordam:
      await handleYordam(ctx);
      return true;
    default:
      return false;
  }
}
