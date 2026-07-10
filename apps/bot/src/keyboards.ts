import { InlineKeyboard } from "grammy";
import { config } from "./config.js";
import { PROFILE_BUTTON_LABEL, REGISTER_BUTTON_LABEL } from "./text.js";

export function registerKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(REGISTER_BUTTON_LABEL, config.webappUrl);
}

export function profileKeyboard(): InlineKeyboard | undefined {
  if (!config.webappUrl) return undefined;
  return new InlineKeyboard().webApp(PROFILE_BUTTON_LABEL, config.webappUrl);
}
