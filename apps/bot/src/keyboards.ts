import { InlineKeyboard, Keyboard } from "grammy";
import { config } from "./config.js";
import { MENU, PROFILE_BUTTON_LABEL, REGISTER_BUTTON_LABEL } from "./text.js";

export function registerKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(REGISTER_BUTTON_LABEL, config.webappUrl);
}

export function profileKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(PROFILE_BUTTON_LABEL, config.webappUrl);
}

/** Doimiy pastki menyu — bot har doim tugmalar bilan boshqariladi. */
export function mainMenuKeyboard(): Keyboard {
  const kb = new Keyboard();
  // Yuqorida to'liq kenglikdagi ilova (web_app) tugmasi.
  if (config.webappUrl) {
    kb.webApp(MENU.ilova, config.webappUrl).row();
  }
  kb.text(MENU.holat)
    .text(MENU.suhbat)
    .row()
    .text(MENU.tolov)
    .text(MENU.profil)
    .row()
    .text(MENU.bildirishnoma)
    .text(MENU.kanal)
    .row()
    .text(MENU.til)
    .text(MENU.yordam);
  return kb.resized().persistent();
}
