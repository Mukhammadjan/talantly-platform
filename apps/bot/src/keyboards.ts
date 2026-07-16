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
  return new Keyboard()
    .text(MENU.holat)
    .text(MENU.profil)
    .row()
    .text(MENU.suhbat)
    .text(MENU.tolov)
    .row()
    .text(MENU.yordam)
    .resized()
    .persistent();
}
