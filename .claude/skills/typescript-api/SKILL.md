---
name: typescript-api
description: Patterns and templates for TypeScript APIs with Fastify, Clean Architecture, DDD, and DI. Triggers when implementing or modifying TypeScript backend code in apps/api/.
---

# TypeScript API Development (Fastify + Clean/DDD + DI)

## Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL via `pg` (Pool injected through DI)
- **Validation**: Zod (env and request validation)
- **Logging**: Pino (via Fastify) + `@Log()` decorator
- **DI**: Manual composition root (no IoC library)

## Layer Structure

```
apps/api/src/
  domain/           # Pure business logic — NO framework, NO DB, NO IO
    entities/       # Objects with identity and invariants
    value-objects/  # Immutable types with validation
    policies/       # Pure rule checks (no IO)
    events/         # Domain events
    errors/         # Invariant violations
  application/      # Orchestration — depends on domain + ports only
    use-cases/      # Accept DTOs → call domain + ports → return DTOs
    ports/          # Repository, gateway, read-model interfaces
    dtos/           # Input/output shapes
    errors/         # Orchestration failures
  infrastructure/   # Concrete implementations
    persistence/postgres/  # Repos + read-models
    http-clients/          # External API gateways
    config/env.ts          # Env validation (zod)
    observability/
      logger.ts            # Pino setup
      decorators.ts        # @Log() decorator
  interfaces/       # Adapters
    http/
      routes/       # Route registration ONLY
      controllers/  # Parse → DTO → use-case
      presenters/   # Result → HTTP response
      middlewares/   # Auth, request-id, validation
  app/
    container.ts    # ONLY composition root
    server.ts       # Fastify setup + error handler
  main.ts
```

## Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Use-case | `verb-noun.usecase.ts` | `create-order.usecase.ts` |
| DTO | `XxxRequest`, `XxxResponse` | `CreateOrderRequest` |
| Port | `XxxRepository`, `XxxGateway` | `OrderRepository` |
| Infra | `PostgresXxx`, `HttpXxx` | `PostgresOrderRepository` |
| Controller | `noun.controller.ts` | `order.controller.ts` |
| Presenter | `noun.presenter.ts` | `order.presenter.ts` |
| Routes | `noun.routes.ts` | `order.routes.ts` |

## Code Templates

### Use-case with @Log() decorator
```typescript
import { Log } from '../../infrastructure/observability/decorators';
import { XxxRepository } from '../ports/repositories/xxx.repository';
import { CreateXxxRequest, CreateXxxResponse } from '../dtos/xxx.dto';

export class CreateXxxUseCase {
  constructor(private readonly xxxRepository: XxxRepository) {}

  @Log()
  async execute(request: CreateXxxRequest): Promise<CreateXxxResponse> {
    // 1. Validate / build domain objects
    // 2. Call ports
    // 3. Return DTO
  }
}
```

### Controller with @Log() decorator
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { Log } from '../../infrastructure/observability/decorators';
import { CreateXxxUseCase } from '../../application/use-cases/create-xxx.usecase';

export class XxxController {
  constructor(private readonly createXxx: CreateXxxUseCase) {}

  @Log({ logArgs: false })
  async create(request: FastifyRequest, reply: FastifyReply) {
    const dto = request.body as CreateXxxRequest;
    const result = await this.createXxx.execute(dto);
    return reply.status(201).send(presentXxx(result));
  }
}
```

### Container wiring
```typescript
export function createContainer(env: AppEnv): Container {
  const logger = createLogger(env.LOG_LEVEL);
  const pgPool = createPgPool(env, logger);

  // Repositories
  const xxxRepository = new PostgresXxxRepository(pgPool);

  // Use-cases
  const createXxx = new CreateXxxUseCase(xxxRepository);

  // Controllers
  const xxxController = new XxxController(createXxx);

  return { env, logger, pgPool, xxxController, dispose: async () => { await pgPool.end(); } };
}
```

### @Log() decorator (infrastructure/observability/decorators.ts)
```typescript
import { logger } from './logger';

interface LogOptions {
  logArgs?: boolean;    // default: true
  logResult?: boolean;  // default: false
}

export function Log(options: LogOptions = {}): MethodDecorator {
  const { logArgs = true, logResult = false } = options;

  return function (_target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const className = this.constructor.name;
      const method = String(propertyKey);
      const start = performance.now();

      logger.info({ class: className, method, ...(logArgs && args.length ? { args: args[0] } : {}) },
        `→ ${className}.${method}`);

      try {
        const result = await original.apply(this, args);
        const duration = Math.round(performance.now() - start);
        logger.info({ class: className, method, duration, ...(logResult ? { result } : {}) },
          `✓ ${className}.${method} (${duration}ms)`);
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - start);
        logger.error({ class: className, method, duration, err: error },
          `✗ ${className}.${method} (${duration}ms)`);
        throw error;
      }
    };
    return descriptor;
  };
}
```

## Gotchas
- Never create `pg.Pool` inside repositories — always inject via constructor
- Never import `container.ts` from domain or application
- Always use `ErrorResponse` schema from OpenAPI for all error responses
- Prefer `unknown` over `any` and narrow with type guards
- Use `@Log()` on every public method of controllers and use-cases
