---
name: fastmvp.constitution
description: Optional constitution for fastmvp project
model: GPT-5.2-Codex (copilot)
agent: agent
---

## Purpose
FastMVP optimizes for: **ship MVP fast**, **contract-first**, **minimal drift**, **clean boundaries**.

## Prompt flow (default)
- constitution (optional/maintenance)
- specify → contracts → tasks-api → implement-api → figma-prompt → tasks-web → implement-web

## Monorepo boundaries
- `apps/api/**`: backend API only (Fastify default; Flask only when explicitly ML-heavy).
- `apps/web/**`: React Native (Expo) frontend only.
- `contracts/**`: source-of-truth artifacts (OpenAPI + SQL).
- Never mix concerns across these folders.

## OpenAPI boundary (non-negotiable)
- API implementation must match `contracts/openapi.yaml`.
- Web consumption must match `contracts/openapi.yaml`.
- No invented endpoints, payloads, status codes, or response shapes.
- If anything is missing: update `contracts/openapi.yaml` first, then implement.

## API architecture (Clean + DDD + DI)
Authoritative layout (do not change):

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

### Dependency rules (non-negotiable)
- `domain/**`: pure business logic. No Fastify, no DB, no env, no IO/framework imports.
- `application/**`: orchestration only. Depends on `domain/**` + `application/**` (ports/dtos/errors). Never import infrastructure/interfaces.
- `infrastructure/**`: implementations only (DB clients, http clients, messaging, config, observability).
- `interfaces/**`: adapters only (HTTP/CLI/consumers). Map input/output; no business logic.
- Composition root is only `apps/api/src/app/container.ts`. DI is mandatory. No global singletons.

## Database policy (SQL files; no migrations; no local DB)
- No ORM migrations.
- Track schema and queries as SQL files intended to be executed manually in your DB client.
- Canonical locations:
  - `contracts/db/schema.sql`
  - `contracts/db/queries/**.sql`
- Do not instruct to spin up local Postgres. Assume Cloud SQL (GCP) exists.

## Web architecture (React Native + Feature-Sliced)
- Use Feature-Sliced under `apps/web/src`: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`.
- No ad-hoc `fetch/axios` sprinkled in UI.
- All network calls must go through `apps/web/src/shared/lib/api/*`.
- Prefer a typed client generated from OpenAPI; until then, keep a single thin wrapper in `shared/lib/api/client.ts`.

## Minimal outputs preference
- Prefer **one output file per prompt step**.
- Avoid generating extra docs unless the step explicitly requires it.

## Assumptions
- Default backend is Fastify + TS; Flask only for ML-heavy projects.
- Frontend is React Native (Expo) + TS, Feature-Sliced.