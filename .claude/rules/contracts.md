---
paths:
  - "contracts/**"
---

# Contract Rules

## OpenAPI (non-negotiable)

- Version: 3.1.0
- Include: `info`, `servers`, `tags`, `paths` with operations, `components/schemas`
- Every operation: `operationId`, request schema, success response, error responses
- Naming: schemas `PascalCase`, properties `camelCase`
- Reusable `ErrorResponse` schema across all contracts
- JSON request/response (unless spec requires multipart)

## Multi-Service

- Main API: `contracts/openapi.yaml`
- Additional services: `contracts/openapi-<name>.yaml`
- Shared `ErrorResponse` schema consistent across all
- Inter-service endpoints documented in callee's contract

## Database SQL

- `contracts/db/schema.sql` — CREATE TABLE, PK/FK, indexes
- `contracts/db/queries/**/*.sql` — organized by feature, param placeholders ($1, $2...)
- `contracts/db/seed.sql` — optional demo data
- No migrations. Canonical schema for manual execution.
- Incremental: new files (e.g., `003_add_feature.sql`), never modify existing.

## Derivation

- Derive endpoints from `docs/spec.md` → `## API needs` and `## User flows`
- Keep minimal: aligned with MVP acceptance criteria only
- No "nice to have" endpoints
