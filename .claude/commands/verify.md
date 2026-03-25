---
name: verify
description: Run build + typecheck + lint to verify project health. Use after implementing changes.
context: fork
---

Run a verification pass on the project:

1. **TypeScript API** (if `apps/api/` exists):
   ```bash
   cd apps/api && npx tsc --noEmit
   ```

2. **Web frontend** (if `apps/web/` exists):
   ```bash
   cd apps/web && npx tsc --noEmit
   ```

3. **OpenAPI lint** (if `contracts/openapi.yaml` exists):
   ```bash
   cd apps/api && npm run openapi:lint
   ```

4. **Python services** (for each `apps/api-*/`):
   ```bash
   cd apps/<service> && python -m py_compile src/main.py
   ```

Report results as:
- PASS: all checks passed
- FAIL: list each failing check with the error

If any check fails, suggest a fix but do NOT auto-fix without user approval.
