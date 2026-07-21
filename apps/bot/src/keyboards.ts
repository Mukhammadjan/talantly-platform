import { InlineKeyboard, Keyboard } from "grammy";
import { config } from "./config.js";
import {
  LOGIN_PWD_LABEL,
  MENU,
  MINI_APP_OPEN_LABEL,
  PROFILE_BUTTON_LABEL,
  REGISTER_BUTTON_LABEL,
} from "./text.js";

export function registerKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(REGISTER_BUTTON_LABEL, config.webappUrl);
}

export function profileKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(PROFILE_BUTTON_LABEL, config.webappUrl);
}

/** Yangi foydalanuvchi uchun rol tanlash — callback (keyin raqam so'raladi). */
export function roleChoiceKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("👤 Men talantman", "role:talant")
    .row()
    .text("💼 Ish beruvchiman", "role:izlovchi");
}

/** Ro'yxatdan o'tgandan keyin: Mini App + «🔑 Login-parol olish» (web uchun). */
export function registeredKeyboard(role: string): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (config.webappUrl) {
    const join = config.webappUrl.includes("?") ? "&" : "?";
    kb.webApp(MINI_APP_OPEN_LABEL, `${config.webappUrl}${join}role=${role}`).row();
  }
  kb.text(LOGIN_PWD_LABEL, "pwd:start");
  return kb;
}

/** Doimiy pastki menyu — bot har doim tugmalar bilan boshqariladi. */
export function mainMenuKeyboard(): Keyboard {
  const kb = new Keyboard();
  kb.text(MENU.holat)
    .text(MENU.suhbat)
    .row()
    .text(MENU.tolov)
    .text(MENU.profil)
    .row()
    .text(MENU.parol)
    .text(MENU.bildirishnoma)
    .row()
    .text(MENU.kanal)
    .text(MENU.til)
    .row()
    .text(MENU.yordam);
  return kb.resized().persistent();
}
