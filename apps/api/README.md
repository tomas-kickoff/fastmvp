# fastmvp API (apps/api)

Backend API built with Fastify + TypeScript following Clean Architecture + DDD + DI boundaries.

## Run locally

From repository root:

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000` by default.

## API contract

OpenAPI contract lives at `contracts/openapi.yaml`. All endpoints must match this contract exactly.

Current implemented route:

- `GET /health`

## Architecture

```
src/
  domain/           # Pure business logic — NO framework, NO DB, NO IO
  application/      # Use-cases, ports, DTOs — depends on domain only
  infrastructure/   # Concrete implementations (Postgres, HTTP clients, logging)
    observability/
      logger.ts     # Pino logger setup
      decorators.ts # @Log() decorator for structured logging
  interfaces/       # HTTP adapters (routes, controllers, presenters)
  app/
    container.ts    # ONLY composition root (DI wiring)
    server.ts       # Fastify setup + error handler
  main.ts           # Entry point
```

### Dependency rules (non-negotiable)

| Layer | Can import | CANNOT import |
|-------|-----------|---------------|
| `domain/` | Nothing external | Fastify, pg, process.env |
| `application/` | `domain/`, `application/ports/`, `application/dtos/` | `infrastructure/`, `interfaces/` |
| `infrastructure/` | Libraries, `domain/`, `application/ports/` | `interfaces/` |
| `interfaces/` | `application/dtos/`, `application/use-cases/` | `domain/` directly, `infrastructure/` directly |

## Logging

Use the `@Log()` decorator from `infrastructure/observability/decorators.ts` on all controller methods and use-case `execute` methods:

```typescript
import { Log } from '../../infrastructure/observability/decorators';

export class OrderController {
  @Log()
  async create(request: FastifyRequest, reply: FastifyReply) { ... }
}
```

Options: `@Log({ logArgs: false })` for sensitive data, `@Log({ logResult: true })` for debugging.

## Environment

Copy `apps/api/.env.example` to `apps/api/.env` if you want custom values.

Supported PostgreSQL config modes:

1. Local/dev TCP connection via `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.
2. Cloud Run + Cloud SQL unix socket via `DATABASE_URL`:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@/DB_NAME?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME&sslmode=disable
```

`pg` pool is wired in DI container (`src/app/container.ts`) for repository implementations.

## Scripts

- `npm run dev` — run API with watch mode
- `npm run build` — compile TypeScript to `dist/`
- `npm run start` — run compiled server
- `npm run openapi:lint` — validate `contracts/openapi.yaml`

## Error model

All errors follow the OpenAPI `ErrorResponse` schema:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error",
    "details": {}
  },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/health"
}
```

Customize via `contracts/defaults/error-model.md` if needed.
