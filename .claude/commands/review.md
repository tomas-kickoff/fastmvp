---
name: review
description: Run the reviewer to check contract alignment and architecture. Use when you want to validate the current state of the codebase.
context: fork
---

Run a full review of the current codebase:

1. Read all `contracts/openapi*.yaml` files
2. Read `docs/spec.md` for service and platform info
3. Check every endpoint has matching route/blueprint
4. Check architectural boundaries (DDD layers, Feature-Sliced layers)
5. Check no orphan endpoints (code without contract or vice versa)
6. Check logging decorators are in use
7. Check no hardcoded styles in frontend

Output a review report with:
- Status (PASS / WARNINGS / ISSUES)
- Contract alignment details
- Architecture check details
- Logging coverage
- Drift detected
- Recommendations
