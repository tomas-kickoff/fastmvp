import { FastifyInstance } from "fastify";
import { HealthController } from "../controllers/health.controller";

export interface HealthRoutesDependencies {
  healthController: HealthController;
}

export async function registerHealthRoutes(
  fastify: FastifyInstance,
  dependencies: HealthRoutesDependencies
): Promise<void> {
  fastify.get("/health", async (_request, reply) => {
    const response = await dependencies.healthController.handle();
    return reply.status(200).send(response);
  });
}
