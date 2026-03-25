---
paths:
  - "apps/api/**/*.ts"
  - "apps/api-*/**/*.ts"
  - "apps/api-*/**/*.py"
---

# Backend Rules (All Services)

## Layer Boundaries (non-negotiable)

| Layer | Can Import | CANNOT Import |
|-------|-----------|---------------|
| `domain/` | Nothing external | Fastify, Flask, pg, psycopg2, process.env, os.environ |
| `application/` | `domain/`, `application/ports/`, `application/dtos/` | `infrastructure/`, `interfaces/` |
| `infrastructure/` | Libraries, `domain/`, `application/ports/` | `interfaces/` |
| `interfaces/` | `application/dtos/`, `application/use-cases/` | `domain/` directly, `infrastructure/` directly |

## DI: Only in container.{ts,py}

- No global singletons. No importing container from domain/application.
- Controllers receive use-cases via constructor injection.
- Use-cases receive ports (interfaces) only.

## OpenAPI Contract is the Boundary

- Implement exactly what `contracts/openapi.yaml` (or `contracts/openapi-<service>.yaml`) specifies.
- If a needed field/route is missing: STOP and report `BLOCKED: <reason>`.
- No invented endpoints, request bodies, response shapes, or status codes.

## Vertical Slice Recipe

1. Update `contracts/openapi.yaml`
2. Add/adjust domain types (entities, value objects, policies, errors)
3. Add application DTOs + port interface(s) + use-case
4. Implement infrastructure adapters (repo, gateway)
5. Add interface route + controller + presenter
6. Wire in `container.{ts,py}`

## TypeScript (Fastify) Specifics

- Naming: `verb-noun.usecase.ts`, `noun.controller.ts`, `noun.presenter.ts`, `noun.routes.ts`
- DTOs: `XxxRequest`, `XxxResponse`
- Ports: `XxxRepository`, `XxxGateway`, `XxxReadModel`
- Infra: `PostgresXxxRepository`, `HttpXxxGateway`
- Use `@Log()` decorator on controllers and use-cases for structured logging.

## Python (Flask) Specifics

- snake_case files, `__init__.py` modules
- Pydantic for DTOs, Protocol for port interfaces
- psycopg2 ThreadedConnectionPool via DI
- Type hints on all functions
- Use `@log_action` decorator on controllers and use-cases.

## Database Policy

- SQL in `contracts/db/` for manual execution. No migrations, no ORM.
- Incremental changes: new files (e.g., `003_add_feature.sql`), never modify existing SQL.
- TypeScript: `pg.Pool` injected via DI. Python: `psycopg2.pool` injected via DI.
