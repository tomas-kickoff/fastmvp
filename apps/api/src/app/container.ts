import { Pool } from "pg";
import type { FastifyBaseLogger } from "fastify";
import { AppEnv } from "../infrastructure/config/env";
import { createLogger } from "../infrastructure/observability/logger";
import { createPgPool } from "../infrastructure/persistence/postgres/db";
import { GetHealthUseCase } from "../application/use-cases/get-health.usecase";
import { HealthController } from "../interfaces/http/controllers/health.controller";
import { HealthPresenter } from "../interfaces/http/presenters/health.presenter";

export interface Container {
  env: AppEnv;
  logger: FastifyBaseLogger;
  pgPool: Pool;
  healthController: HealthController;
  dispose: () => Promise<void>;
}

export function createContainer(env: AppEnv): Container {
  const logger = createLogger(env.LOG_LEVEL);
  const pgPool = createPgPool(env, logger);

  const getHealthUseCase = new GetHealthUseCase();
  const healthPresenter = new HealthPresenter();
  const healthController = new HealthController(getHealthUseCase, healthPresenter);

  return {
    env,
    logger,
    pgPool,
    healthController,
    dispose: async () => {
      await pgPool.end();
    }
  };
}
