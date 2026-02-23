# Copilot Instructions (fastmvp)

## Big picture
- Monorepo with API and Web apps: `apps/api` (Fastify + TS, Clean/DDD) and `apps/web` (frontend, stack depends on `## Platform` in `docs/spec.md`).
- Supported frontend platforms:
  - `web`: React + Next.js (App Router) + TypeScript
  - `mobile`: React Native (Expo) + TypeScript
  - `both`: both stacks sharing `contracts/` and API client
- API surface is defined by `contracts/openapi.yaml`. Both API and Web must align with it; update the contract first when adding fields/endpoints.

## API architecture (apps/api)
- Clean/DDD layers under `apps/api/src`: `domain`, `application`, `infrastructure`, `interfaces`, and composition root in `app/container.ts`.
- Dependency direction: `interfaces`/`infrastructure` -> `application` -> `domain`. No inward violations.
- DI is mandatory; only `src/app/container.ts` wires implementations. Controllers receive use-cases via DI.
- HTTP responsibilities: routes bind handlers, controllers validate/map to DTOs, presenters shape responses.
- Error mapping is centralized (Fastify error handler in `src/app/server.ts`); responses must match OpenAPI `ErrorResponse`.
- Postgres: build `pg.Pool` in infrastructure, inject via DI; repos/read-models must not create pools. Env config lives in `infrastructure/config/env.ts`.

## Web architecture (apps/web)
- Feature-Sliced structure under `apps/web/src`: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Platform is defined in `docs/spec.md` under `## Platform`:
  - `mobile`: React Native (Expo) + React Navigation
  - `web`: React + Next.js (App Router) — `app/` directory doubles as Next.js routes
- Data fetching only in `features/**/model/*` or `entities/**/model/*` via `shared/lib/api/*`. No direct `fetch`/`axios` in pages/widgets/shared UI.
- UI primitives use `app/theme/tokens.ts` (no ad-hoc styling).
- Mobile: route names in `app/navigation/routes.ts`, types in `shared/types/navigation.ts`.
- Web: routes defined by Next.js file system, navigation types in `shared/types/navigation.ts`.

## Workflows and commands
- From repo root: `npm install` then `npm run dev` to run API (Fastify on http://localhost:3000).
- Web app: `npm run dev:web` from root, or `npm run start` inside `apps/web`.
- Validate OpenAPI: `npm run openapi:lint` (API app).

## Project conventions
- Implement vertical slices: update OpenAPI -> domain/app DTOs/ports/use-cases -> infra adapters -> interface routes/controllers/presenters -> wire DI.
- Error model default (if no `contracts/defaults/error-model.md`) is documented in [apps/api/README.md](apps/api/README.md).

## Key references
- API rules: [.github/instructions/api.instructions.md](.github/instructions/api.instructions.md)
- Web rules: [.github/instructions/web.instructions.md](.github/instructions/web.instructions.md)
- API README: [apps/api/README.md](apps/api/README.md)
- Web README: [apps/web/README.md](apps/web/README.md)
