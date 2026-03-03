---
name: typescript-api
description: Patterns and templates for building TypeScript APIs with Fastify, Clean Architecture, DDD, and Dependency Injection. Use when implementing or modifying a TypeScript backend service in apps/api or any apps/api-* directory using Fastify.
---

# TypeScript API Development (Fastify + Clean/DDD + DI)

This skill provides patterns, conventions, and templates for building TypeScript backend APIs following Clean Architecture with DDD and Dependency Injection.

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL via `pg` (Pool injected through DI)
- **Validation**: Zod (recommended for env and request validation)
- **Logging**: Pino (via Fastify built-in or standalone)
- **DI**: Manual composition root (no IoC container library needed)

## Layer Structure

```
apps/<service>/src/
  domain/           # Pure business logic — NO framework, NO DB, NO IO
    entities/       # Objects with identity and invariants
    value-objects/  # Immutable types with validation
    policies/       # Pure rule checks (no IO)
    repositories/   # Repository interfaces (rare — prefer application ports)
    events/         # Domain events (facts that happened)
    errors/         # Invariant violations, invalid state

  application/      # Orchestration — depends on domain + ports only
    use-cases/      # Accept DTOs → call domain + ports → return DTOs
    ports/
      repositories/ # Write model interfaces
      gateways/     # External system interfaces (APIs, ML services, etc.)
      read-models/  # Query-optimized interfaces
    dtos/           # Use-case input/output shapes
    errors/         # Orchestration/port boundary failures

  infrastructure/   # Concrete implementations of ports
    persistence/
      postgres/
        repositories/  # PostgresXxxRepository implements XxxRepository
        read-models/   # PostgresXxxReadModel implements XxxReadModel
    http-clients/      # HttpXxxGateway implements XxxGateway
    messaging/         # Event producers/consumers
    config/
      env.ts           # Env validation (zod recommended)
    observability/
      logger.ts        # Pino logger setup

  interfaces/       # Adapters — maps external input/output
    http/
      routes/       # Route registration + handler binding ONLY
      controllers/  # Parse request → DTO → call use-case
      presenters/   # Use-case result → HTTP response shape
      middlewares/   # Auth, request-id, input validation wrappers
    cli/            # CLI commands (optional)
    consumers/      # Message consumers (optional)

  app/
    container.ts    # ONLY composition root (DI wiring)
    server.ts       # Fastify setup, error handler, plugin registration
  main.ts           # Entry point
```

## Dependency Rules (enforce strictly)

| Layer | Can import | CANNOT import |
|-------|-----------|---------------|
| `domain/` | Nothing external | Fastify, pg, process.env, any IO |
| `application/` | `domain/`, `application/ports/`, `application/dtos/` | `infrastructure/`, `interfaces/` |
| `infrastructure/` | Libraries, `domain/`, `application/ports/` | `interfaces/` |
| `interfaces/` | `application/dtos/`, `application/use-cases/` | `domain/` directly, `infrastructure/` directly |

## Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Use-case | `verb-noun.usecase.ts` | `create-order.usecase.ts` |
| DTO types | `XxxRequest`, `XxxResponse` | `CreateOrderRequest` |
| Port interfaces | `XxxRepository`, `XxxGateway`, `XxxReadModel` | `OrderRepository` |
| Infra implementations | `PostgresXxx`, `HttpXxx` | `PostgresOrderRepository` |
| Controller | `noun.controller.ts` | `order.controller.ts` |
| Presenter | `noun.presenter.ts` | `order.presenter.ts` |
| Routes | `noun.routes.ts` | `order.routes.ts` |

## Vertical Slice Recipe

For any new feature:

1. **Contract**: update `contracts/openapi.yaml` (or service-specific yaml)
2. **Domain**: add/adjust entities, value objects, policies, errors
3. **Application**: add DTOs + port interface(s) + use-case
4. **Infrastructure**: implement adapters (repo, gateway, read-model)
5. **Interfaces**: add route + controller + presenter
6. **Wire**: register in `container.ts`

## Code Templates

### Use-case template
```typescript
import { XxxRepository } from '../ports/repositories/xxx.repository';
import { CreateXxxRequest, CreateXxxResponse } from '../dtos/xxx.dto';

export class CreateXxxUseCase {
  constructor(private readonly xxxRepository: XxxRepository) {}

  async execute(request: CreateXxxRequest): Promise<CreateXxxResponse> {
    // 1. Validate / build domain objects
    // 2. Call ports
    // 3. Return DTO
  }
}
```

### Controller template
```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateXxxUseCase } from '../../application/use-cases/create-xxx.usecase';
import { presentXxx } from '../presenters/xxx.presenter';

export class XxxController {
  constructor(private readonly createXxx: CreateXxxUseCase) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const dto = request.body as CreateXxxRequest; // or validate with zod
    const result = await this.createXxx.execute(dto);
    return reply.status(201).send(presentXxx(result));
  }
}
```

### Container wiring template
```typescript
import { Pool } from 'pg';
import { createPool } from '../infrastructure/persistence/postgres/db';
import { PostgresXxxRepository } from '../infrastructure/persistence/postgres/repositories/xxx.repository';
import { CreateXxxUseCase } from '../application/use-cases/create-xxx.usecase';
import { XxxController } from '../interfaces/http/controllers/xxx.controller';

export function buildContainer() {
  const pool: Pool = createPool();

  // Repositories
  const xxxRepository = new PostgresXxxRepository(pool);

  // Use-cases
  const createXxx = new CreateXxxUseCase(xxxRepository);

  // Controllers
  const xxxController = new XxxController(createXxx);

  return { pool, xxxController };
}
```

## Error Handling Pattern

```typescript
// domain/errors/domain.error.ts
export class DomainError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

// Fastify error handler in server.ts
app.setErrorHandler((error, request, reply) => {
  if (error instanceof DomainError) {
    return reply.status(400).send({
      error: { code: error.code, message: error.message },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
  // ... handle other error types
});
```

## Database Access Pattern

```typescript
// infrastructure/persistence/postgres/repositories/xxx.repository.ts
import { Pool } from 'pg';
import { XxxRepository } from '../../../../application/ports/repositories/xxx.repository';

export class PostgresXxxRepository implements XxxRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Xxx | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM xxx WHERE id = $1',
      [id]
    );
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  private toDomain(row: Record<string, unknown>): Xxx {
    // Map DB row → domain entity
  }
}
```

## Guidelines

- Never create `pg.Pool` inside repositories — always inject via constructor
- Never import `container.ts` from domain or application layers
- Keep controllers thin — validation + DTO mapping + use-case call
- Keep presenters pure — transform use-case result to HTTP response shape
- Use `ErrorResponse` schema from OpenAPI for all error responses
- Prefer explicit types over `any` — use `unknown` and narrow
