---
paths:
  - "apps/web/**/*.{ts,tsx}"
  - "apps/mobile/**/*.{ts,tsx}"
---

# Frontend Rules (Web & Mobile)

## Feature-Sliced Design (non-negotiable)

```
app/        → Bootstrap, providers, navigation, theme. No business logic.
pages/      → Screens composing widgets/features. Minimal logic.
widgets/    → Large UI blocks. No data fetching.
features/   → User actions/flows. Can call APIs via shared boundary.
entities/   → Entity types, local storage utilities.
shared/     → UI primitives, hooks, config, API client.
```

## Data Fetching (non-negotiable)

- API calls ONLY in `features/**/model/*` or `entities/**/model/*`
- All calls through `shared/lib/api/*` client
- No `fetch`/`axios` in pages, widgets, or shared/ui
- UI components receive data via props — keep them pure

## Theming

Priority for tokens:
1. `resources/figma/tokens.json` (Figma-exported)
2. `resources/brand/tokens.json`
3. Minimal neutral token set

All styling via `app/theme/tokens.ts`. No hardcoded colors/spacing.

## Platform-Specific

### Web (Next.js) — default for `web` platform
- App Router (`app/` directory for routes)
- `next/navigation` for routing
- Server components where possible, `'use client'` only when needed
- CSS modules or Tailwind

### Mobile (Expo) — for `mobile` platform
- React Navigation for routing
- Route names in `app/navigation/routes.ts`
- AsyncStorage for persistence
- React Native primitives (`View`, `Text`, `TouchableOpacity`)

## OpenAPI Boundary

- Read from `contracts/openapi.yaml` (main) or `contracts/openapi-<service>.yaml`
- No invented endpoints or ad-hoc fetch calls
- Multiple APIs: client supports multiple base URLs
