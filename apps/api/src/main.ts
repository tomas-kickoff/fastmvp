import { buildServer } from "./app/server";
import { createContainer } from "./app/container";
import { loadEnv } from "./infrastructure/config/env";

async function bootstrap(): Promise<void> {
  const env = loadEnv(process.env);
  const container = createContainer(env);
  const app = await buildServer(container);

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    container.logger.info({ signal }, "Shutting down server");
    await app.close();
    await container.dispose();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  try {
    await app.listen({
      host: "0.0.0.0",
      port: env.PORT
    });

    container.logger.info({ port: env.PORT }, "API server listening");
  } catch (error) {
    container.logger.error({ err: error }, "Failed to start API server");
    await app.close();
    await container.dispose();
    process.exit(1);
  }
}

void bootstrap();
