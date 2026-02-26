# fastmvp workflow

This repo is a **monorepo MVP factory**:
- `apps/api` = backend (Fastify + Clean Architecture + DDD + DI)
- `apps/web` = frontend (React Native Expo + Feature-Sliced)
- `contracts/openapi.yaml` = **the boundary** (source of truth)

## Agents (recommended)

Custom agents in `.github/agents/` orchestrate the full workflow. Select an agent from the Copilot agents dropdown.

### FastMVP — Build a new MVP
**Agent:** `FastMVP` (in agents dropdown)
**Input:** your idea (text)
**What it does:** Runs the full pipeline automatically via subagents:

```
Specifier → Contract → API Planner + Designer (parallel)
  → API Dev → Web Planner → Web Dev → Reviewer
```

**Outputs:**
- `docs/spec.md` — product spec
- `contracts/openapi.yaml` — API contract (+ optional `contracts/db/*.sql`)
- `docs/figma.md` — Figma Make prompts + data mapping
- `docs/tasks-api.md` — API checklist (completed)
- `docs/tasks-web.md` — Web checklist (completed)
- `apps/api/**` — implemented backend
- `apps/web/**` — implemented frontend

After completion, handoff buttons appear: **[Add a Feature]** **[Fix a Bug]**

### Feature Builder — Add a feature
**Agent:** `Feature Builder` (in agents dropdown)
**Input:** feature description
**What it does:** Reads existing spec/contract/code, then incrementally:
- Appends to spec, updates contract, plans + implements only the new feature
- Never rewrites existing code — only adds

### Bug Fixer — Fix a bug
**Agent:** `Bug Fixer` (in agents dropdown)
**Input:** bug description
**What it does:** Diagnoses, locates root cause, classifies (API/Web/contract), fixes, and validates.

## Agent architecture

```
.github/agents/
  ├── fastmvp.agent.md          # Orchestrator: new MVP (user-invokable)
  ├── feature-builder.agent.md  # Orchestrator: add feature (user-invokable)
  ├── bug-fixer.agent.md        # Orchestrator: fix bugs (user-invokable)
  ├── specifier.agent.md        # Worker: idea → spec
  ├── contract.agent.md         # Worker: spec → openapi + SQL
  ├── api-planner.agent.md      # Worker: spec + openapi → tasks-api
  ├── api-dev.agent.md          # Worker: implements API
  ├── designer.agent.md          # Worker: spec + openapi → figma prompts + tokens
  ├── design-integrator.agent.md # Orchestrator: Figma Make code → integrated frontend
  ├── web-planner.agent.md      # Worker: spec + openapi + figma → tasks-web
  ├── web-dev.agent.md          # Worker: implements Web
  └── reviewer.agent.md         # Worker: validates contract ↔ code alignment
```

Workers have `user-invokable: false` — they only run as subagents, not from the dropdown.

## Figma integration

### During MVP creation (automatic)
1. **Designer** agent generates `docs/figma.md` with prompts for Figma Make
2. Pipeline continues — Web Dev implements a functional frontend without waiting for Figma

### After MVP creation (optional, for polished UI)
3. Copy screen prompts from `docs/figma.md` into **Figma Make**
4. Figma Make generates React code per screen
5. Save each screen's code to `resources/figma/screens/<ScreenName>.tsx`
6. Select **Design Integrator** agent (or click the handoff button) → it integrates the Figma code into `apps/web/src/`:
   - Maps hardcoded styles → design tokens
   - Extracts reusable components → `shared/ui/`
   - Wires real API data (replaces placeholders)
   - Respects Feature-Sliced architecture

### Token sync (optional)
- Export tokens via [Tokens Studio](https://tokens.studio/) → `resources/figma/tokens.json`
- Web Dev and Design Integrator auto-detect and use them

## Legacy prompt files

The original prompt files in `.github/prompts/` still work for manual step-by-step execution. See each file for inputs/outputs. The agents are the recommended approach.

### 0) Constitution (maintenance)
**Prompt:** `.github/prompts/fastmvp.constitution.prompt.md`
**Output:** `.github/copilot-instructions.md`

## Coming Soon (Roadmap)
- **Documentation Agents**: Automated generation and maintenance of project documentation.
- **CI/CD Agents**: Controlled, step-by-step releases to production environments.
- **Multi-language Skills**: Agents equipped with skills for different programming languages beyond the current stack.

## Non-negotiables
- **OpenAPI is the boundary:** no invented endpoints/payloads on API or Web.
- **API uses DDD + DI:** wiring happens only in `apps/api/src/app/container.ts`.
- **DB policy:** SQL files for manual execution in a DB client (no migrations, no local Postgres).
- **Web uses Feature-Sliced:** `app/pages/widgets/features/entities/shared`, networking only via `shared/lib/api/*`.






