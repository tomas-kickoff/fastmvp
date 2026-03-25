---
name: vertical-slice
description: Implement a single vertical slice (one endpoint end-to-end)
---

Implement a single vertical slice for the specified endpoint/feature.

What to implement: $ARGUMENTS

Follow this order:
1. Check `contracts/openapi.yaml` for the endpoint definition
2. Add/adjust domain types (entities, value objects, errors) if needed
3. Add application DTOs + port interface(s) + use-case (with `@Log()` decorator)
4. Implement infrastructure adapter (repo/gateway)
5. Add interface route + controller (with `@Log()` decorator) + presenter
6. Wire everything in `container.ts`
7. Verify the route is registered and matches OpenAPI spec

Keep changes minimal. One slice at a time.
