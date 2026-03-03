# fastmvp workflow

This repo is a **monorepo MVP factory**:
- `apps/api` = primary backend (Fastify + TypeScript + Clean Architecture + DDD + DI) — always present
- `apps/api-<name>` = additional backends (Flask + Python — only when a different tech stack is needed, e.g., ML/AI)
- `apps/web` = web frontend (React + Next.js + Feature-Sliced) — default
- `apps/mobile` = mobile frontend (React Native Expo + Feature-Sliced) — when platform=mobile or both
- `contracts/openapi.yaml` = **main API boundary** (source of truth)
- `contracts/openapi-<name>.yaml` = contract per additional service

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
- `docs/spec.md` — product spec (includes `## Services` table and `## Platform`)
- `contracts/openapi.yaml` — API contract (+ `contracts/openapi-<name>.yaml` per additional service)
- `contracts/db/*.sql` — optional database schema
- `docs/figma.md` — Figma Make prompts + data mapping
- `docs/tasks-api.md` — API checklist (completed) + `docs/tasks-api-<name>.md` per additional service
- `docs/tasks-web.md` — Web checklist (completed)
- `apps/api/**` — implemented TypeScript backend
- `apps/api-<name>/**` — implemented Python backend(s) (if needed)
- `apps/web/**` — implemented web frontend (or `apps/mobile/**` for mobile)

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
  ├── specifier.agent.md        # Worker: idea → spec (multi-service aware)
  ├── contract.agent.md         # Worker: spec → openapi(s) + SQL
  ├── api-planner.agent.md      # Worker: spec + openapi → tasks per service
  ├── api-dev.agent.md          # Worker: implements API (TS or Python)
  ├── designer.agent.md         # Worker: spec + openapi → figma prompts + tokens
  ├── design-integrator.agent.md # Orchestrator: Figma Make code → integrated frontend
  ├── web-planner.agent.md      # Worker: spec + openapi + figma → tasks-web
  ├── web-dev.agent.md          # Worker: implements Web or Mobile
  └── reviewer.agent.md         # Worker: validates contract ↔ code alignment

.github/skills/
  ├── typescript-api/           # Skill: TS/Fastify + DDD patterns & templates
  │   ├── SKILL.md
  │   └── references/
  ├── python-api/              # Skill: Python/Flask + DDD patterns & templates
  │   ├── SKILL.md
  │   └── references/
  ├── react-nextjs-web/        # Skill: Next.js + Feature-Sliced patterns
  │   └── SKILL.md
  └── react-native-mobile/     # Skill: React Native + Feature-Sliced patterns
      └── SKILL.md
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
- **OpenAPI is the boundary:** no invented endpoints/payloads on API or Web. Each service has its own contract.
- **All backends use DDD + DI:** wiring happens only in `container.{ts,py}`.
  - TypeScript: `apps/api/src/app/container.ts`
  - Python: `apps/<service>/src/app/container.py`
- **DB policy:** SQL files for manual execution in a DB client (no migrations, no local Postgres).
- **Web uses Feature-Sliced:** `app/pages/widgets/features/entities/shared`, networking only via `shared/lib/api/*`.
- **Default platform is web** (React + Next.js). Expo only for mobile.
- **Minimize services:** default to one API. Additional services only when a different tech stack is truly needed (e.g., Python for ML/AI).






