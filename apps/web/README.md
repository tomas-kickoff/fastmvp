# fastmvp Web App (apps/web)

Frontend template built with Expo + TypeScript using Feature-Sliced Design architecture.

## Run locally

From repository root:

```bash
npm install
npm run dev:web
```

From `apps/web`:

```bash
npm install
npm run start
```

## Architecture (Feature-Sliced Design)

```
src/
  app/        # Bootstrap, providers, navigation, theme
  pages/      # Screens composing widgets/features
  widgets/    # Large UI blocks (no data fetching)
  features/   # User actions/flows with API calls via shared boundary
  entities/   # Entity types, local storage utilities
  shared/     # UI primitives, hooks, config, API client
```

### Layer rules (non-negotiable)

| Layer | Responsibility | Can fetch data? |
|-------|---------------|-----------------|
| `app/` | Bootstrap, providers, theme | No |
| `pages/` | Compose + minimal logic | No |
| `widgets/` | Large UI composition | No |
| `features/` | User actions + API calls | Yes (via `shared/lib/api/`) |
| `entities/` | Entity types + helpers | Yes (via `shared/lib/api/`) |
| `shared/` | Primitives, hooks, config | No (provides the API client) |

### Data fetching

- All API calls through `shared/lib/api/client.ts`
- No direct `fetch`/`axios` in pages, widgets, or shared/ui
- UI components receive data via props — keep them pure

## Theming

All styling via `app/theme/tokens.ts`. No hardcoded colors or spacing.

Token priority:
1. `resources/figma/tokens.json` (Figma-exported)
2. `resources/brand/tokens.json`
3. Minimal neutral token set

## Dev tooling

When creating a new project, agents install:
- **LocatorJS** — click-to-source in browser (dev only): `Option+click` on any element opens it in your editor

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

Key variables:
- `API_URL` / `NEXT_PUBLIC_API_URL` — main API base URL
- `ML_API_URL` / `NEXT_PUBLIC_ML_API_URL` — ML API base URL (when multiple services)

## Current scope

- Mocked local authentication (no backend calls)
- Session persistence in AsyncStorage
- Root navigation between Login and Home
