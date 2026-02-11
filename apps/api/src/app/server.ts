import Fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { ApplicationError } from "../application/errors/application.error";
import { DomainError } from "../domain/errors/domain.error";
import { registerHealthRoutes } from "../interfaces/http/routes/health.routes";
import { Container } from "./container";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  path: string;
}

interface MappedError {
  statusCode: number;
  body: ErrorResponseBody;
}

function isValidationError(error: FastifyError): boolean {
  return Array.isArray((error as FastifyError & { validation?: unknown[] }).validation);
}

function mapErrorToHttp(error: FastifyError, request: FastifyRequest): MappedError {
  if (error instanceof DomainError || error instanceof ApplicationError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        },
        timestamp: new Date().toISOString(),
        path: request.url
      }
    };
  }

  if (isValidationError(error)) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "BAD_REQUEST",
          message: "Request validation failed",
          details: {
            validation: (error as FastifyError & { validation?: unknown[] }).validation
          }
        },
        timestamp: new Date().toISOString(),
        path: request.url
      }
    };
  }

  return {
    statusCode: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error"
      },
      timestamp: new Date().toISOString(),
      path: request.url
    }
  };
}

function registerErrorHandler(app: FastifyInstance, container: Container): void {
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const mappedError = mapErrorToHttp(error, request);

    if (mappedError.statusCode >= 500) {
      container.logger.error({ err: error }, "Unhandled application error");
    } else {
      container.logger.warn({ err: error }, "Handled application error");
    }

    reply.status(mappedError.statusCode).send(mappedError.body);
  });
}

export async function buildServer(container: Container): Promise<FastifyInstance> {
  const app = Fastify({ logger: container.logger });

  registerErrorHandler(app, container);
  await registerHealthRoutes(app, {
    healthController: container.healthController
  });

  return app;
}
