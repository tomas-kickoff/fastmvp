# API Implementation Rules

## Dependency rules (non-negotiable)

- `domain`: pure business logic. No Fastify, no Postgres, no `process.env`, no IO, no framework imports.
- `application`: use-cases orchestrate domain. Depends only on `domain` + `application/ports/**` + `application/dtos/**`. Never import `infrastructure`.
- `infrastructure`: concrete implementations (Postgres repos, read-models, external HTTP clients, messaging). Can import libraries.
- `interfaces`: adapters (HTTP/CLI/consumers). Maps external input/output to application DTOs and presenters. No business rules.
- Composition root: only `src/app/container.ts` wires implementations to ports and builds the app graph.

## Dependency Injection

- DI is mandatory. Use `src/app/container.ts` as the single composition root.
- No global singletons. No importing the container inside `domain`/`application`.
- Controllers receive use-cases (or application services) via DI.
- Use-cases receive ports (interfaces) only.

## OpenAPI contract is the boundary

- `contracts/openapi.yaml` is the source of truth for:
  - Routes/paths, methods, request/response schemas, status codes, error shapes.
- Implement exactly what OpenAPI specifies.
- If you need a new field/endpoint: update `contracts/openapi.yaml` first, then implement.

## DTOs and mapping

- Define input/output DTOs in `application/dtos/**`.
- HTTP layer responsibilities:
  - Controller: HTTP request -> DTO, call use-case.
  - Presenter: use-case result -> HTTP response shape.
- Do not return database models directly in HTTP responses.

## Error handling

- Define base errors in:
  - `domain/errors/**`
  - `application/errors/**`
- Convert errors to HTTP in one place:
  - Prefer a Fastify error handler registered in `src/app/server.ts`.
- Error response shape must match the OpenAPI `ErrorResponse` schema.

## PostgreSQL (GCP Cloud SQL)

- Postgres wiring belongs in `infrastructure/persistence/postgres/**`.
- Read and validate env in `infrastructure/config/env.ts`.
- Support both connection modes:
  - Local/dev TCP: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
  - Cloud Run + Cloud SQL socket via `DATABASE_URL` using:
    - `postgresql://USER:PASSWORD@/DBNAME?host=/cloudsql/PROJECT:REGION:INSTANCE`
- Create a `pg.Pool` in infrastructure and inject it via the DI container.
- Repositories/read-models must not create their own pools.

## Fastify usage rules

- `interfaces/http/routes/**`: only route registration and handler binding.
- `interfaces/http/controllers/**`: validation + DTO mapping + use-case invocation.
- `interfaces/http/presenters/**`: response shaping only.
- No domain logic in routes/controllers.

## Minimal quality bar

- Keep changes small and layered (vertical slices).
- No invented payloads, no assumed endpoints: always align with OpenAPI.
- Prefer explicit and readable naming. Avoid magic abstractions.

## Minimal “vertical slice” template (how to build features)

For any feature:
- Update contracts/openapi.yaml
- Add/adjust domain types/rules (if needed)
- Add application DTOs + port(s) + use-case
- Implement infrastructure adapters (repo/gateway)
- Add interface route + controller + presenter
- Wire in container.ts