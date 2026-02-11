# fastmvp workflow (quick)

This repo is a **monorepo MVP factory**:
- `apps/api` = backend (Fastify + Clean Architecture + DDD + DI)
- `apps/web` = frontend (React Native Expo + Feature-Sliced)
- `contracts/openapi.yaml` = **the boundary** (source of truth)

## How to run the flow (Copilot prompt files)

### 0) (Optional) Constitution
**Prompt:** `.github/prompts/fastmvp.constitution.prompt.md`  
**Output:** `.github/copilot-instructions.md`  
Use only to refresh repo rules.

### 1) Specify
**Prompt:** `.github/prompts/fastmvp.specify.prompt.md`  
**Input:** your idea (text)  
**Output:** `docs/spec.md` (MVP scope, flows, screens, conceptual data model, acceptance criteria)

### 2) Contracts
**Prompt:** `.github/prompts/fastmvp.contracts.prompt.md`  
**Input:** `#docs/spec.md` update openapi.yaml and create db file if neccesary
**Output:** `contracts/openapi.yaml` (+ optional DB SQL if needed)

### 3) Tasks (API)
**Prompt:** `.github/prompts/fastmvp.tasks-api.prompt.md`  
**Inputs:** `#docs/spec.md` + `#contracts/openapi.yaml`  
**Output:** `docs/tasks-api.md`

### 4) Implement (API)
**Prompt:** `.github/prompts/fastmvp.implement-api.prompt.md`  
**Inputs:** `#contracts/openapi.yaml` + `#docs/tasks-api.md`  
**Output:** `apps/api/**` + updates checkboxes in `docs/tasks-api.md`

### 5) Figma prompts (optional)
**Prompt:** `.github/prompts/fastmvp.figma-prompt.prompt.md`  
**Inputs:** `#docs/spec.md` + `#contracts/openapi.yaml`  
**Output:** `docs/figma.md` (screen prompts + screen→endpoint mapping)

### 6) Tasks (Web)
**Prompt:** `.github/prompts/fastmvp.tasks-web.prompt.md`  
**Inputs:** `#docs/spec.md` + `#contracts/openapi.yaml` + `#docs/figma.md`  
**Output:** `docs/tasks-web.md`

### 7) Implement (Web)
**Prompt:** `.github/prompts/fastmvp.implement-web.prompt.md`  
**Inputs:** `#contracts/openapi.yaml` + `#docs/tasks-web.md` (+ `#docs/figma.md` if used)  
**Output:** `apps/web/**` + updates checkboxes in `docs/tasks-web.md`

## Non-negotiables
- **OpenAPI is the boundary:** no invented endpoints/payloads on API or Web.
- **API uses DDD + DI:** wiring happens only in `apps/api/src/app/container.ts`.
- **DB policy:** SQL files for manual execution in a DB client (no migrations, no local Postgres).
- **Web uses Feature-Sliced:** `app/pages/widgets/features/entities/shared`, networking only via `shared/lib/api/*`.






