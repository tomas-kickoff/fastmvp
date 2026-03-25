---
name: status
description: Show current project status — spec, contracts, implementation progress. Use when you want a quick dashboard of where the project stands.
context: fork
---

Analyze the current state of the FastMVP project and report:

1. **Spec**: Does `docs/spec.md` exist? How many features? Any open questions?
2. **Contracts**: Which `contracts/openapi*.yaml` files exist? How many endpoints total?
3. **API**: Which services exist? Read their task files — how many tasks complete vs pending?
4. **Web**: Does `docs/tasks-web.md` exist? How many tasks complete vs pending?
5. **Figma**: Does `docs/figma.md` exist? How many screens defined?
6. **Learnings**: Any entries in `.claude/learnings/gotchas.md`?

Format as a concise dashboard.
