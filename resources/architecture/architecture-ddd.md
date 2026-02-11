
## Purpose
This document is the *dev-facing* reference for the API architecture used by **fastmvp**.
It defines layer boundaries, dependency rules, DI expectations, and where code lives.

## Core principles
- **DDD-first**: business rules live in `domain/`.
- **Clean boundaries**: outer layers depend inward; never the opposite.
- **Ports & adapters**: application defines ports; infrastructure implements them.
- **Contract-first**: `contracts/openapi.yaml` is the API boundary (no invented payloads).
- **Composition root**: dependency wiring happens only in `src/app/container.ts`.

---

## Folder layout (authoritative)

```txt
apps/api/src/
  domain/
    entities/
    value-objects/
    policies/
    repositories/
    events/
    errors/

  application/
    use-cases/
    ports/
      repositories/
      gateways/
      read-models/
    dtos/
    errors/

  infrastructure/
    persistence/
      postgres/
        repositories/
        read-models/
    http-clients/
    messaging/
    config/
    observability/

  interfaces/
    http/
      controllers/
      routes/
      middlewares/
      presenters/
    cli/
    consumers/

  app/
    container.ts
    server.ts

  main.ts
Dependency rules (non-negotiable)
Allowed imports:

domain/* may import only domain/* (and TS/stdlib types).

application/* may import domain/* and application/*.

infrastructure/* may import application/*, domain/*, and external libraries (pg, http clients, etc.).

interfaces/* may import application/*, domain/* (types), and framework libs (Fastify).

app/* may import anything needed to wire dependencies and start the server.

Forbidden imports:

domain/* importing from application/*, infrastructure/*, interfaces/*, or Fastify/pg.

application/* importing from infrastructure/* or interfaces/*.

Responsibilities by layer
1) Domain (src/domain)
What lives here

Entities: objects with identity and invariants.

Value Objects: immutable types with validation (Money, Email, Coordinates, etc.).

Policies: pure rule checks (e.g., “can user perform X?”) with no IO.

Domain events: facts that happened (e.g., ReceiptParsed, ParcelListed).

Domain errors: invariants violations, invalid state transitions.

Repository interfaces (optional): only if they truly belong to domain (rare). Prefer app ports.

What must NOT live here

HTTP, DB, messaging, environment, dates “now” from system unless passed in.

2) Application (src/application)
What lives here

Use-cases: orchestration of domain + ports; transaction boundaries.

Ports (interfaces):

ports/repositories: write models

ports/read-models: query models optimized for reads

ports/gateways: external systems (OpenAI, geocoders, payments, etc.)

DTOs: use-case request/response shapes.

Application errors: failures at orchestration/port boundaries.

Rules

Use-cases accept DTOs and return DTOs or typed results.

Use-cases depend only on ports, never on concrete DB/client implementations.

3) Infrastructure (src/infrastructure)
What lives here

Concrete implementations of ports:

Postgres repositories + read models

HTTP clients / SDK wrappers

Messaging producers/consumers (if used)

Config loading and env validation (config/)

Observability: logger, tracing, metrics (observability/)

Rules

DB code is here only. Use pg.Pool (or equivalent) injected from DI container.

Infrastructure objects must satisfy the port interfaces defined by application.

4) Interfaces (src/interfaces)
What lives here

HTTP:

routes: register routes only

controllers: parse/validate request, call use-case

presenters: shape HTTP response (status/body), map errors

middlewares: auth, request-id, input validation wrappers

CLI commands (optional)

Consumers for messaging (optional) — they call use-cases

Rules

No business rules here.

No DB queries here.

Controllers call use-cases and pass DTOs.

5) App (src/app) and Bootstrap (src/main.ts)
app/container.ts: the only composition root (DI wiring).

app/server.ts: create Fastify instance, register routes, register error handler.

main.ts: load env, build container, start server.

Dependency Injection (DI)
Create and register all dependencies in src/app/container.ts.

Inject ports into use-cases; inject use-cases into controllers.

Avoid hidden dependencies and global singletons.

Recommended pattern

Container exposes factories like:

makeGetHealthUseCase()

makeReceiptController()

Or a typed registry:

container.useCases.getHealth

container.controllers.health

OpenAPI contract boundary
contracts/openapi.yaml is the API contract.

Routes, request/response schemas, error shapes must match the contract.

If requirements change, update OpenAPI first, then implement.

Postgres (GCP Cloud SQL) conventions
Env lives in apps/api/.env.example.

Support both:

Local TCP envs: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

Cloud SQL socket with DATABASE_URL=postgresql://...?...host=/cloudsql/...

Create pg.Pool in infrastructure/persistence/postgres/* and inject via DI.

Repositories must not create connections on their own.

Minimal “vertical slice” template (how to build features)
For any feature:

Update contracts/openapi.yaml

Add/adjust domain types/rules (if needed)

Add application DTOs + port(s) + use-case

Implement infrastructure adapters (repo/gateway)

Add interface route + controller + presenter

Wire in container.ts

Naming conventions
Use-case names: verb-noun.usecase.ts (e.g., get-health.usecase.ts)

DTO names: XxxRequest, XxxResponse

Port interfaces: XxxRepository, XxxReadModel, XxxGateway

Infrastructure implementations: PostgresXxxRepository, HttpXxxGateway

What “done” means (fastmvp version)
Contract exists (contracts/openapi.yaml)

The route is implemented and runnable

DI wiring is in place

The feature follows the layer boundaries above