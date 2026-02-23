# Web Implementation Rules

## Scope
These instructions apply to `apps/web/**` only.

## Stack (platform-dependent)
The platform is defined in `docs/spec.md` under `## Platform`:

### Mobile
- React Native (Expo) + TypeScript
- React Navigation for routing
- AsyncStorage for persistence

### Web
- React + Next.js (App Router) + TypeScript
- `next/navigation` and `next/link` for routing
- Cookies/localStorage for persistence
- Server components where possible, `'use client'` only when needed
- Tailwind CSS or CSS modules for styling

## Frontend architecture: Feature-Sliced (FSD)
Use a Feature-Sliced structure under `apps/web/src`:

```
apps/web/src/
  app/                 # app entry, navigation, providers, theme
  pages/               # screens (compose widgets/features)
  widgets/             # large UI blocks used by pages
  features/            # user actions (auth/login, search, etc.)
  entities/            # business entities for UI (user, receipt, parcel, etc.)
  shared/              # reusable UI kit, libs, config, hooks, types
```

Responsibilities and boundaries (non-negotiable)
- `app/`: app bootstrap only (providers, navigation, theming). No business logic.
- `pages/`: compose widgets/features for a route/screen. Minimal logic.
- `widgets/`: reusable page-level blocks. No data fetching.
- `features/`: user interactions and flows (e.g., login, assign letter, search). Can call APIs via shared client.
- `entities/`: entity types, small helpers, local storage utilities related to the entity.
- `shared/`: UI primitives (Button/Input), generic hooks, config/env, and API client plumbing.

## OpenAPI contract boundary (monorepo rule)
- `contracts/openapi.yaml` is the source of truth for API shapes.
- Do not invent payloads or ad-hoc `fetch()` calls.
- All network calls must go through `shared/lib/api/*`.
- Prefer a generated typed client from OpenAPI. Until generated, keep a thin placeholder client in `shared/lib/api/client.ts`.
- If an endpoint or field is missing: update `contracts/openapi.yaml` first (do not patch around it in the UI).

## Data fetching rules
- No direct `fetch`/`axios` usage in `pages/**`, `widgets/**`, or `shared/ui/**`.
- API calls are allowed only in:
  - `features/**/model/*` or `entities/**/model/*` (through shared API client)
- UI components should receive data via props; keep them pure.

## State management
- Default: React state + context for session-level concerns.
- Put session/auth state under:
  - `app/providers/*` and/or `features/auth/*`
- Persist only what is needed using AsyncStorage wrappers in `shared/lib/storage/*` or `entities/*/lib/*`.

## UI and theming
- Use `app/theme/tokens.ts` as the single source for colors/spacing/typography.
- `shared/ui/*` components must use tokens (no hardcoded random styling).
- Keep components small and reusable; avoid duplicating UI primitives.

## Navigation
- Define route names in `app/navigation/routes.ts`.
- Keep navigation types in `shared/types/navigation.ts`.
- Pages correspond to routes; avoid deep navigation logic in features.

## Quality bar
- Keep code minimal and runnable.
- Prefer explicit naming and simple patterns.
- Avoid mixing responsibilities across layers (FSD boundaries above).
