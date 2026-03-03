---
name: python-api
description: Patterns and templates for building Python APIs with Flask, Clean Architecture, DDD, and Dependency Injection. Use when implementing or modifying a Python backend service in apps/api-ml or any Python-based apps/api-* directory.
---

# Python API Development (Flask + Clean/DDD + DI)

This skill provides patterns, conventions, and templates for building Python backend APIs following Clean Architecture with DDD and Dependency Injection.

## Stack

- **Runtime**: Python 3.11+
- **Framework**: Flask (with flask-cors, flask-restful or plain blueprints)
- **Database**: PostgreSQL via `psycopg2` (connection pool injected through DI)
- **Validation**: Pydantic v2 (for DTOs and env config)
- **Logging**: Python `logging` module (structured JSON in production)
- **ML libraries**: As needed (scikit-learn, torch, transformers, etc.)
- **Package management**: `requirements.txt` or `pyproject.toml` with pip
- **Typing**: Strict — use type hints everywhere, enforce with mypy/pyright

## Layer Structure

```
apps/<service>/
  requirements.txt        # or pyproject.toml
  README.md
  src/
    __init__.py
    main.py               # Entry point — creates app via container

    domain/
      __init__.py
      entities/            # Objects with identity and invariants
      value_objects/       # Immutable types with validation
      policies/            # Pure rule checks (no IO)
      repositories/        # Repository interfaces (Protocol classes)
      events/              # Domain events
      errors/              # Domain-specific exceptions

    application/
      __init__.py
      use_cases/           # Orchestration — accept DTOs, call ports, return DTOs
      ports/
        repositories/      # Write model interfaces (Protocol)
        gateways/          # External system interfaces (ML models, APIs)
        read_models/       # Query-optimized interfaces
      dtos/                # Pydantic models for use-case I/O
      errors/              # Application-level exceptions

    infrastructure/
      __init__.py
      persistence/
        postgres/
          db.py            # Connection pool factory
          repositories/    # Concrete repo implementations
          read_models/     # Concrete read model implementations
      ml/                  # ML model loaders, inference wrappers
      http_clients/        # External API clients
      messaging/           # Event producers/consumers
      config/
        env.py             # Env validation (Pydantic BaseSettings)
      observability/
        logger.py          # Logging setup

    interfaces/
      __init__.py
      http/
        blueprints/        # Flask blueprints (route registration only)
        controllers/       # Parse request → DTO → call use-case
        presenters/        # Use-case result → HTTP response dict
        middlewares/        # Auth, request-id, error handler

    app/
      __init__.py
      container.py         # ONLY composition root (DI wiring)
      server.py            # Flask app factory, error handlers, CORS
```

## Dependency Rules (enforce strictly)

| Layer | Can import | CANNOT import |
|-------|-----------|---------------|
| `domain/` | Standard library only | Flask, psycopg2, os.environ, any IO |
| `application/` | `domain/`, `application/ports/`, `application/dtos/` | `infrastructure/`, `interfaces/` |
| `infrastructure/` | Libraries, `domain/`, `application/ports/` | `interfaces/` |
| `interfaces/` | `application/dtos/`, `application/use_cases/` | `domain/` directly, `infrastructure/` directly |

## Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Use-case | `verb_noun_usecase.py` | `predict_sentiment_usecase.py` |
| DTO models | `XxxRequest`, `XxxResponse` (Pydantic) | `PredictSentimentRequest` |
| Port interfaces | `XxxRepository`, `XxxGateway`, `XxxReadModel` (Protocol) | `ModelRepository` |
| Infra implementations | `PostgresXxx`, `HttpXxx`, `LocalXxx` | `PostgresModelRepository` |
| Controller | `noun_controller.py` | `prediction_controller.py` |
| Presenter | `noun_presenter.py` | `prediction_presenter.py` |
| Blueprint | `noun_bp.py` | `prediction_bp.py` |

## Vertical Slice Recipe

For any new feature:

1. **Contract**: update `contracts/openapi-<service>.yaml`
2. **Domain**: add/adjust entities, value objects, policies, errors
3. **Application**: add DTOs (Pydantic) + port Protocol(s) + use-case class
4. **Infrastructure**: implement adapters (repo, gateway, ML wrapper)
5. **Interfaces**: add blueprint + controller + presenter
6. **Wire**: register in `container.py`

## Code Templates

### Use-case template
```python
# application/use_cases/predict_sentiment_usecase.py
from ..dtos.prediction_dto import PredictSentimentRequest, PredictSentimentResponse
from ..ports.gateways.ml_gateway import MLGateway


class PredictSentimentUseCase:
    def __init__(self, ml_gateway: MLGateway) -> None:
        self._ml_gateway = ml_gateway

    def execute(self, request: PredictSentimentRequest) -> PredictSentimentResponse:
        result = self._ml_gateway.predict(request.text)
        return PredictSentimentResponse(
            sentiment=result.label,
            confidence=result.score,
        )
```

### Port interface template (Protocol)
```python
# application/ports/gateways/ml_gateway.py
from typing import Protocol
from ...domain.value_objects.prediction import PredictionResult


class MLGateway(Protocol):
    def predict(self, text: str) -> PredictionResult: ...
    def batch_predict(self, texts: list[str]) -> list[PredictionResult]: ...
```

### DTO template (Pydantic)
```python
# application/dtos/prediction_dto.py
from pydantic import BaseModel, Field


class PredictSentimentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class PredictSentimentResponse(BaseModel):
    sentiment: str
    confidence: float = Field(..., ge=0.0, le=1.0)
```

### Controller template
```python
# interfaces/http/controllers/prediction_controller.py
from flask import request, jsonify
from ....application.use_cases.predict_sentiment_usecase import PredictSentimentUseCase
from ....application.dtos.prediction_dto import PredictSentimentRequest
from ..presenters.prediction_presenter import present_prediction


class PredictionController:
    def __init__(self, predict_sentiment: PredictSentimentUseCase) -> None:
        self._predict_sentiment = predict_sentiment

    def predict(self):
        dto = PredictSentimentRequest.model_validate(request.get_json())
        result = self._predict_sentiment.execute(dto)
        return jsonify(present_prediction(result)), 200
```

### Blueprint template
```python
# interfaces/http/blueprints/prediction_bp.py
from flask import Blueprint
from ..controllers.prediction_controller import PredictionController


def create_prediction_blueprint(controller: PredictionController) -> Blueprint:
    bp = Blueprint("predictions", __name__, url_prefix="/predictions")

    @bp.route("/sentiment", methods=["POST"])
    def predict_sentiment():
        return controller.predict()

    return bp
```

### Container template
```python
# app/container.py
from ..infrastructure.config.env import Settings
from ..infrastructure.persistence.postgres.db import create_pool
from ..infrastructure.ml.local_ml_gateway import LocalMLGateway
from ..application.use_cases.predict_sentiment_usecase import PredictSentimentUseCase
from ..interfaces.http.controllers.prediction_controller import PredictionController


class Container:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.pool = create_pool(settings)

        # Gateways
        self.ml_gateway = LocalMLGateway(model_path=settings.MODEL_PATH)

        # Use-cases
        self.predict_sentiment = PredictSentimentUseCase(self.ml_gateway)

        # Controllers
        self.prediction_controller = PredictionController(self.predict_sentiment)
```

### Flask app factory template
```python
# app/server.py
from flask import Flask, jsonify
from flask_cors import CORS
from .container import Container
from ..interfaces.http.blueprints.prediction_bp import create_prediction_blueprint


def create_app(container: Container) -> Flask:
    app = Flask(__name__)
    CORS(app)

    # Register blueprints
    app.register_blueprint(create_prediction_blueprint(container.prediction_controller))

    # Global error handler
    @app.errorhandler(Exception)
    def handle_error(error):
        if hasattr(error, 'code') and hasattr(error, 'message'):
            return jsonify({
                "error": {"code": error.code, "message": error.message},
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "path": request.path,
            }), getattr(error, 'status_code', 500)
        return jsonify({
            "error": {"code": "INTERNAL_ERROR", "message": "Internal server error"},
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "path": request.path,
        }), 500

    return app
```

### Env config template
```python
# infrastructure/config/env.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PORT: int = 5000
    FLASK_ENV: str = "development"
    DATABASE_URL: str | None = None
    PGHOST: str = "localhost"
    PGPORT: int = 5432
    PGUSER: str = "postgres"
    PGPASSWORD: str = "postgres"
    PGDATABASE: str = "fastmvp"
    MODEL_PATH: str = "./models"

    class Config:
        env_file = ".env"
```

## ML-specific Patterns

### Model loading (infrastructure layer)
```python
# infrastructure/ml/local_ml_gateway.py
from ...application.ports.gateways.ml_gateway import MLGateway
from ...domain.value_objects.prediction import PredictionResult


class LocalMLGateway:
    """Loads and serves ML models locally."""

    def __init__(self, model_path: str) -> None:
        self._model = self._load_model(model_path)

    def _load_model(self, path: str):
        # Load model once at startup (expensive operation)
        import joblib
        return joblib.load(path)

    def predict(self, text: str) -> PredictionResult:
        raw = self._model.predict([text])[0]
        return PredictionResult(label=raw["label"], score=raw["score"])
```

### Inter-service gateway (call another API)
```python
# infrastructure/http_clients/core_api_gateway.py
import httpx
from ...application.ports.gateways.core_api_gateway import CoreApiGateway


class HttpCoreApiGateway:
    """Calls the main TypeScript API for shared data."""

    def __init__(self, base_url: str) -> None:
        self._client = httpx.Client(base_url=base_url, timeout=10.0)

    def get_user(self, user_id: str) -> dict:
        response = self._client.get(f"/users/{user_id}")
        response.raise_for_status()
        return response.json()
```

## Guidelines

- Never create DB connection pools inside repositories — always inject via constructor
- Never import `container.py` from domain or application layers
- Use Pydantic for all DTOs and config — no raw dicts crossing layer boundaries
- Use `Protocol` classes for port interfaces (not ABC unless state is needed)
- Keep Flask blueprints thin — route registration only, delegate to controllers
- Use `ErrorResponse` schema from OpenAPI for all error responses
- ML models should be loaded once at startup, not per-request
- Type-hint everything — no `Any` unless absolutely necessary
