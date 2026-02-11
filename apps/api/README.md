# fastmvp API (apps/api)

Backend API built with Fastify + TypeScript following Clean Architecture + DDD boundaries.

## Run locally

From repository root:

```bash
npm install
npm run dev
```

Server runs on `http://localhost:3000` by default.

## API contract

OpenAPI contract lives at `contracts/openapi.yaml`.
Current implemented route:

- `GET /health`

## Environment

Copy `apps/api/.env.example` to `apps/api/.env` if you want custom values.

Supported PostgreSQL config modes:

1. Local/dev TCP connection via `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`.
2. Cloud Run + Cloud SQL unix socket via `DATABASE_URL`, for example:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@/DB_NAME?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME&sslmode=disable
```

`pg` pool is wired in DI container (`src/app/container.ts`) for repository implementations.

## Scripts

- `npm run dev` - run API with watch mode.
- `npm run build` - compile TypeScript to `dist/`.
- `npm run start` - run compiled server.
- `npm run openapi:lint` - validate `contracts/openapi.yaml`.

## Error model

If `contracts/defaults/error-model.md` is not provided, this API uses:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error",
    "details": {}
  },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/health"
}
```
