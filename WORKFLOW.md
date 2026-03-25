# fastmvp workflow

This repo is a **monorepo MVP factory** that supports **N backend services** and **N frontend platforms**:
- `apps/api` = primary backend (Fastify + TypeScript + Clean Architecture + DDD + DI) — always present as template
- `apps/api-<name>` = additional backends (Flask + Python — only when a different tech stack is needed, e.g., ML/AI)
- `apps/web` = web frontend (default: Expo, or Next.js for web-only) — template
- `apps/mobile` = mobile frontend (React Native Expo) — when platform=mobile or both
- `contracts/openapi.yaml` = **main API boundary** (source of truth)
- `contracts/openapi-<name>.yaml` = contract per additional service

## Dual-mode: Copilot + Claude Code

FastMVP works with **both** GitHub Copilot agents and Claude Code agents. The same pipeline runs in either mode.

### GitHub Copilot (VS Code)
Select an agent from the Copilot agents dropdown. Agents live in `.github/agents/`.

### Claude Code (CLI / IDE)
Use slash commands or mention agents by name. Agents live in `.claude/agents/`.

| Action | Copilot | Claude Code |
|--------|---------|-------------|
| Build MVP | Select `FastMVP` agent | `/build-mvp <idea>` or `@fastmvp` |
| Add feature | Select `Feature Builder` | `/add-feature <description>` or `@feature-builder` |
| Fix bug | Select `Bug Fixer` | `/fix-bug <description>` or `@bug-fixer` |
| Review | Select `Reviewer` | `/review` |
| Project status | — | `/status` |
| Single endpoint | — | `/vertical-slice <endpoint>` |

## Agent Pipeline

```
Idea → Specifier → Contract → [API Planner + Designer] → API Dev → Web Planner → Web Dev → Reviewer → Retro
```

### FastMVP — Build a new MVP
**Input:** your idea (text)
**Pipeline:** Specifier → Contract → API Planner + Designer (parallel) → API Dev → Web Planner → Web Dev → Reviewer → Retro
**Outputs:**
- `docs/spec.md` — product spec (includes `## Services` table and `## Platform`)
- `contracts/openapi.yaml` — API contract (+ per-service contracts)
- `contracts/db/*.sql` — optional database schema
- `docs/figma.md` — Figma Make prompts + data mapping
- `docs/tasks-api.md` — API checklist + per-service task files
- `docs/tasks-web.md` — Web checklist
- `apps/api/**` — implemented backend(s)
- `apps/web/**` — implemented frontend
- `.claude/learnings/metrics.md` — pipeline run metrics

### Feature Builder — Add a feature
**Input:** feature description
**What it does:** Reads existing spec/contract/code, then incrementally appends to spec, updates contract, plans + implements only the new feature.

### Bug Fixer — Fix a bug
**Input:** bug description
**What it does:** Diagnoses, locates root cause, classifies (API/Web/contract), fixes, and validates.

## Agent Architecture

```
.claude/agents/                    # Claude Code agents
  ├── fastmvp.md                   # Orchestrator: new MVP
  ├── feature-builder.md           # Orchestrator: add feature
  ├── bug-fixer.md                 # Orchestrator: fix bugs
  ├── specifier.md                 # Worker: idea → spec
  ├── contract.md                  # Worker: spec → openapi + SQL
  ├── api-planner.md               # Worker: spec + openapi → tasks
  ├── api-dev.md                   # Worker: implements API
  ├── designer.md                  # Worker: spec → figma prompts
  ├── design-integrator.md         # Orchestrator: Figma code → frontend
  ├── web-planner.md               # Worker: spec + openapi → web tasks
  ├── web-dev.md                   # Worker: implements frontend
  ├── reviewer.md                  # Worker: validates alignment
  └── retro.md                     # Worker: evaluates pipeline + saves learnings

.claude/skills/                    # Reusable knowledge bases
  ├── typescript-api/SKILL.md      # Fastify + DDD patterns & templates
  └── react-web/SKILL.md           # React + FSD patterns

.claude/commands/                  # Slash commands
  ├── build-mvp.md                 # /build-mvp <idea>
  ├── add-feature.md               # /add-feature <desc>
  ├── fix-bug.md                   # /fix-bug <desc>
  ├── review.md                    # /review
  ├── status.md                    # /status
  └── vertical-slice.md            # /vertical-slice <endpoint>

.claude/rules/                     # Path-scoped instructions
  ├── api.md                       # Backend rules (apps/api/**)
  ├── web.md                       # Frontend rules (apps/web/**)
  └── contracts.md                 # Contract rules (contracts/**)

.claude/learnings/                 # Continuous improvement
  ├── gotchas.md                   # Accumulated pipeline learnings
  └── metrics.md                   # Per-run metrics

.github/agents/                    # Copilot agents (same pipeline)
.github/skills/                    # Copilot skills
.github/instructions/              # Copilot instructions
```

## Feedback Loop (Continuous Improvement)

After each pipeline run, the **retro** agent:
1. Reads the reviewer's process feedback
2. Analyzes what went well and what didn't
3. Appends learnings to `.claude/learnings/gotchas.md`
4. Tracks metrics in `.claude/learnings/metrics.md`
5. Flags recurring patterns (3+ occurrences) as `[RECURRING]` for agent/rule changes

This creates a **virtuous loop**: each run improves the next one.

## Figma Integration

### During MVP creation (automatic)
1. **Designer** agent generates `docs/figma.md` with prompts for Figma Make
2. Pipeline continues — Web Dev implements a functional frontend without waiting

### After MVP creation (optional)
3. Paste screen prompts into **Figma Make**
4. Save generated code to `resources/figma/screens/<ScreenName>.tsx`
5. Use **Design Integrator** to integrate Figma code into the frontend

## Dev Tooling (installed per project, not in template)

When creating a new project, agents will:
- Install **LocatorJS** (`locatorjs`) for click-to-source in browser (dev only)
- Set up **@Log() decorators** for structured logging on controllers and use-cases
- Configure **prettier** auto-format via PostToolUse hook

## Non-negotiables
- **OpenAPI is the boundary:** no invented endpoints/payloads. Each service has its own contract.
- **All backends use DDD + DI:** wiring happens only in `container.{ts,py}`.
- **DB policy:** SQL files for manual execution in a DB client (no migrations, no local Postgres).
- **Frontends use Feature-Sliced:** `app/pages/widgets/features/entities/shared`, networking only via `shared/lib/api/*`.
- **Minimize services:** default to one API. Additional services only when a different tech stack is truly needed.
- **Incremental, not destructive:** features append to spec/contracts/tasks. Never rewrite.
- **Logging:** `@Log()` decorator on all controllers and use-cases. No bare `console.log`.

## Token Efficiency Strategies

- **Lean CLAUDE.md** (<60 lines active content) — detailed rules live in `.claude/rules/` (loaded by path)
- **Skills load on-demand** — not every session pays the token cost
- **Subagent isolation** — workers run in fresh contexts, only results bubble up
- **Interview-driven specs** — specifier skips obvious questions, asks max 8 targeted ones
- **Commands for inner loops** — `/review`, `/status` avoid re-explaining intent each time
- **Auto-compact at 70%** — prevents context degradation in long sessions
