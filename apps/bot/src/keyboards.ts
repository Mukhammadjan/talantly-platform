import { InlineKeyboard, Keyboard } from "grammy";
import { config } from "./config.js";
import {
  MENU,
  PROFILE_BUTTON_LABEL,
  REGISTER_BUTTON_LABEL,
  REGISTER_WEB_LABEL,
} from "./text.js";

export function registerKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(REGISTER_BUTTON_LABEL, config.webappUrl);
}

/** Web ro'yxati (raqam + parol) — «🔐 Ro'yxatdan o'tish» + ilova tugmasi. */
export function webRegisterKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard().text(REGISTER_WEB_LABEL, "reg:start");
  if (config.webappUrl) {
    kb.row().webApp("📱 Ilovani ochish", config.webappUrl);
  }
  return kb;
}

export function profileKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(PROFILE_BUTTON_LABEL, config.webappUrl);
}

/** Yangi foydalanuvchi uchun rol tanlash — tanlov ilovada saqlanadi. */
export function roleChoiceKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  const join = config.webappUrl.includes("?") ? "&" : "?";
  return new InlineKeyboard()
    .webApp("👤 Men talantman", `${config.webappUrl}${join}role=talant`)
    .row()
    .webApp("💼 Ish beruvchiman", `${config.webappUrl}${join}role=izlovchi`);
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
