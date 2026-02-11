import { Pool, PoolConfig } from "pg";
import { AppEnv } from "../../../infrastructure/config/env";
import type { FastifyBaseLogger } from "fastify";

export function createPgPool(env: AppEnv, logger: FastifyBaseLogger): Pool {
  const baseConfig: PoolConfig = {
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS
  };

  const config: PoolConfig = env.DATABASE_URL
    ? {
        ...baseConfig,
        connectionString: env.DATABASE_URL
      }
    : {
        ...baseConfig,
        host: env.PGHOST,
        port: env.PGPORT,
        user: env.PGUSER,
        password: env.PGPASSWORD,
        database: env.PGDATABASE
      };

  if (env.PGSSLMODE === "require") {
    config.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(config);

  pool.on("error", (error) => {
    logger.error({ err: error }, "Unexpected PostgreSQL idle client error");
  });

  return pool;
}
