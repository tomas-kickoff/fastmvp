```instructions
# Python API Implementation Rules

## Scope
These instructions apply to Python-based backend services (e.g., `apps/api-ml/`). For TypeScript APIs, see `api.instructions.md`.

## Stack
- Python 3.11+ with strict typing (type hints everywhere)
- Flask as HTTP framework (with flask-cors)
- PostgreSQL via `psycopg2` (pool injected through DI)
- Pydantic v2 for DTOs and config validation
- Standard `logging` module for observability

## Dependency rules (non-negotiable)

- `domain`: pure business logic. No Flask, no psycopg2, no `os.environ`, no IO, no framework imports.
- `application`: use-cases orchestrate domain. Depends only on `domain` + `application/ports/**` + `application/dtos/**`. Never import `infrastructure`.
- `infrastructure`: concrete implementations (Postgres repos, read-models, ML model wrappers, external HTTP clients, messaging). Can import libraries.
- `interfaces`: adapters (HTTP/CLI/consumers). Maps external input/output to application DTOs and presenters. No business rules.
- Composition root: only `src/app/container.py` wires implementations to ports and builds the app graph.

## Dependency Injection

- DI is mandatory. Use `src/app/container.py` as the single composition root.
- No global singletons. No importing the container inside `domain`/`application`.
- Controllers receive use-cases (or application services) via DI.
- Use-cases receive ports (Protocol interfaces) only.

## OpenAPI contract is the boundary

- Each Python service has its own OpenAPI file: `contracts/openapi-<service>.yaml`
- Implement exactly what OpenAPI specifies.
- If you need a new field/endpoint: update the contract first, then implement.

## DTOs and mapping

- Use Pydantic v2 models for all DTOs in `application/dtos/**`.
- HTTP layer responsibilities:
  - Controller: Flask request → Pydantic DTO, call use-case.
  - Presenter: use-case result → dict for JSON response.
- Do not return database rows or ORM models directly in HTTP responses.

## Error handling

- Define base exceptions in:
  - `domain/errors/`
  - `application/errors/`
- Convert exceptions to HTTP in one place:
  - Use Flask `@app.errorhandler` registered in `src/app/server.py`.
- Error response shape must match the OpenAPI `ErrorResponse` schema.

## PostgreSQL

- Postgres wiring belongs in `infrastructure/persistence/postgres/**`.
- Read and validate env in `infrastructure/config/env.py` (Pydantic BaseSettings).
- Support both connection modes:
  - Local/dev TCP: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
  - Cloud Run + Cloud SQL socket via `DATABASE_URL`
- Create a `psycopg2.pool.ThreadedConnectionPool` in infrastructure and inject it via the DI container.
- Repositories/read-models must not create their own pools.

## Flask usage rules

- `interfaces/http/blueprints/**`: only route registration and handler binding.
- `interfaces/http/controllers/**`: validation + DTO mapping + use-case invocation.
- `interfaces/http/presenters/**`: response shaping only.
- No domain logic in blueprints/controllers.

## ML-specific rules

- ML model loading belongs in `infrastructure/ml/`.
- Models are loaded once at startup (in `container.py`), not per-request.
- ML inference is exposed through gateway ports (`application/ports/gateways/`).
- Training pipelines, if any, are separate scripts — not part of the HTTP request path.
- Heavy dependencies (torch, transformers, etc.) are imported only in `infrastructure/ml/`.

## Inter-service communication

- If this service needs data from the main TypeScript API, use an HTTP gateway in `infrastructure/http_clients/`.
- Define a gateway port in `application/ports/gateways/` and implement it in infrastructure.
- Never call other services directly from domain or application layers.

## Naming conventions

- Use-case files: `verb_noun_usecase.py` (e.g., `predict_sentiment_usecase.py`)
- DTO types: `XxxRequest`, `XxxResponse` (Pydantic models)
- Port interfaces: `XxxRepository`, `XxxReadModel`, `XxxGateway` (Protocol classes)
- Infrastructure implementations: `PostgresXxxRepository`, `HttpXxxGateway`, `LocalXxxGateway`
- Blueprints: `noun_bp.py`
- Controllers: `noun_controller.py`
- Presenters: `noun_presenter.py`

## Minimal quality bar

- Keep changes small and layered (vertical slices).
- No invented payloads, no assumed endpoints: always align with OpenAPI.
- Type hints on every function signature and class attribute.
- Use `Protocol` for port interfaces, `dataclass` or Pydantic for domain/app types.

## Layer structure (authoritative)

```
apps/<service>/src/
  domain/
    entities/
    value_objects/
    policies/
    repositories/    # Protocol interfaces (rare)
    events/
    errors/

  application/
    use_cases/
    ports/
      repositories/
      gateways/
      read_models/
    dtos/
    errors/

  infrastructure/
    persistence/
      postgres/
        db.py
        repositories/
        read_models/
    ml/              # ML model loaders and wrappers
    http_clients/
    messaging/
    config/
      env.py
    observability/
      logger.py

  interfaces/
    http/
      blueprints/
      controllers/
      presenters/
      middlewares/
    cli/
    consumers/

  app/
    container.py
    server.py
  main.py
```

## Definition of "done"

- Contract exists in `contracts/openapi-<service>.yaml`
- The route is implemented and runnable (Flask dev server)
- DI wiring is in place in `container.py`
- The feature follows the layer boundaries above
- Type hints are complete (no untyped functions)

```
