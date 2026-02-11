import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  DATABASE_URL: z.string().min(1).optional(),
  PGHOST: z.string().min(1).default("127.0.0.1"),
  PGPORT: z.coerce.number().int().positive().default(5432),
  PGUSER: z.string().min(1).default("postgres"),
  PGPASSWORD: z.string().default("postgres"),
  PGDATABASE: z.string().min(1).default("postgres"),
  PGSSLMODE: z.enum(["disable", "require"]).default("disable"),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),
  DB_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(10000)
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(rawEnv: NodeJS.ProcessEnv): AppEnv {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment variables: ${errors}`);
  }

  return parsed.data;
}
