import { pino, stdSerializers } from "pino";

export const logger = pino({
  level:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  serializers: { err: stdSerializers.err },
});
