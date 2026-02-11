import type { FastifyBaseLogger } from "fastify";
import pino from "pino";

export function createLogger(level: string): FastifyBaseLogger {
  return pino({
    level,
    redact: ["req.headers.authorization"]
  }) as FastifyBaseLogger;
}
