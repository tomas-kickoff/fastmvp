# Copilot Instructions (fastmvp)

## Big picture
- Monorepo MVP factory supporting **N backend services** and **multiple frontend platforms**.
- Backend services live in `apps/api` (TypeScript/Fastify — always present) and optionally `apps/api-<name>` (Python/Flask — for ML/AI/etc.).
- Frontend apps: `apps/web` (React + Next.js — default for web) and `apps/mobile` (React Native Expo — for mobile).
- All backends follow **DDD + Clean Architecture + DI** regardless of language.
- All frontends follow **Feature-Sliced Design** regardless of platform.
- Supported frontend platforms (defined in `docs/spec.md` → `## Platform`):
  - `web`: React + Next.js (App Router) + TypeScript → `apps/web/`
  - `mobile`: React Native (Expo) + TypeScript → `apps/mobile/`
  - `both`: both stacks sharing `contracts/` and API client patterns
- API surface defined by `contracts/openapi.yaml` (main API) and `contracts/openapi-<name>.yaml` (additional services). Both API and frontend must align; update contracts first when adding fields/endpoints.

## Multi-service architecture
- Default: one backend service (`apps/api` — TypeScript/Fastify). This handles CRUD, auth, business logic.
- Additional services only when a different technology stack is required (e.g., Python for ML/AI).
- Each service has: its own directory (`apps/<service>/`), its own contract (`contracts/openapi-<name>.yaml`), its own task file (`docs/tasks-<name>.md`).
- Inter-service communication goes through HTTP gateways defined as application ports.
- The `## Services` table in `docs/spec.md` is the authoritative list.

## API architecture (all backends)
- Clean/DDD layers: `domain`, `application`, `infrastructure`, `interfaces`, and composition root in `app/container.{ts,py}`.
- Dependency direction: `interfaces`/`infrastructure` → `application` → `domain`. No inward violations.
- DI is mandatory; only the composition root wires implementations.

### TypeScript backends (apps/api)
- Fastify + TypeScript. Rules: [.github/instructions/api.instructions.md](.github/instructions/api.instructions.md)
- Composition root: `src/app/container.ts`
- Postgres via `pg.Pool` injected through DI

### Python backends (apps/api-<name>)
- Flask + Python 3.11+. Rules: [.github/instructions/python-api.instructions.md](.github/instructions/python-api.instructions.md)
- Composition root: `src/app/container.py`
- Postgres via `psycopg2` pool injected through DI
- Pydantic for DTOs, Protocol for port interfaces

## Web architecture (apps/web and apps/mobile)
- Feature-Sliced structure: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Platform is defined in `docs/spec.md` under `## Platform`:
  - `web` (DEFAULT): React + Next.js (App Router) — `app/` directory doubles as Next.js routes → `apps/web/`
  - `mobile`: React Native (Expo) + React Navigation → `apps/mobile/`
- Data fetching only in `features/**/model/*` or `entities/**/model/*` via `shared/lib/api/*`. No direct `fetch`/`axios` in pages/widgets/shared UI.
- If multiple APIs exist, the API client supports multiple base URLs.
- UI primitives use `app/theme/tokens.ts` (no ad-hoc styling).
- Mobile: route names in `app/navigation/routes.ts`, types in `shared/types/navigation.ts`.
- Web: routes defined by Next.js file system, navigation types in `shared/types/navigation.ts`.

## Workflows and commands
- From repo root: `npm install` then `npm run dev` to run API (Fastify on http://localhost:3000).
- Web app: `npm run dev:web` from root, or `npm run start` inside `apps/web`.
- Python services: `pip install -r requirements.txt` inside `apps/<service>/`, then `python -m src.main`.
- Validate OpenAPI: `npm run openapi:lint` (API app).

## Agent skills
- Skills live in `.github/skills/` and are loaded dynamically by Copilot when relevant.
- Available skills: `typescript-api`, `python-api`, `react-nextjs-web`, `react-native-mobile`.
- Skills provide language/framework-specific patterns, templates, and conventions.

## Project conventions
- Implement vertical slices: update OpenAPI → domain/app DTOs/ports/use-cases → infra adapters → interface routes/controllers/presenters → wire DI.
- Error model default (if no `contracts/defaults/error-model.md`) is documented in [apps/api/README.md](apps/api/README.md).

## Key references
- API rules (TypeScript): [.github/instructions/api.instructions.md](.github/instructions/api.instructions.md)
- API rules (Python): [.github/instructions/python-api.instructions.md](.github/instructions/python-api.instructions.md)
- Web rules: [.github/instructions/web.instructions.md](.github/instructions/web.instructions.md)
- API README: [apps/api/README.md](apps/api/README.md)
- Web README: [apps/web/README.md](apps/web/README.md)
