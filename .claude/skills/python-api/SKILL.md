---
name: python-api
description: Patterns and templates for Python APIs with Flask, Clean Architecture, DDD, and DI. Triggers when implementing or modifying Python backend code in apps/api-* directories.
---

# Python API Development (Flask + Clean/DDD + DI)

## Stack
- **Runtime**: Python 3.11+
- **Framework**: Flask (blueprints)
- **Database**: PostgreSQL via `psycopg2` (ThreadedConnectionPool injected through DI)
- **Validation**: Pydantic v2 (DTOs and env config)
- **Logging**: Python `logging` (structured JSON in production) + `@log_action` decorator
- **Typing**: Strict — type hints everywhere, Protocol for port interfaces
- **ML libraries**: As needed (scikit-learn, torch, transformers, etc.)

## Layer Structure

```
apps/<service>/src/
  domain/           # Pure business logic — NO Flask, NO DB, NO IO
    entities/       value_objects/  policies/  repositories/  events/  errors/
  application/      # Orchestration — depends on domain + ports only
    use_cases/      ports/(repositories/ gateways/ read_models/)  dtos/  errors/
  infrastructure/   # Concrete implementations
    persistence/postgres/(db.py  repositories/  read_models/)
    ml/             # ML model loaders, inference wrappers
    http_clients/   # External API clients
    config/env.py   # Pydantic BaseSettings
    observability/(logger.py  decorators.py)
  interfaces/       # Adapters
    http/(blueprints/  controllers/  presenters/  middlewares/)
  app/
    container.py    # ONLY composition root
    server.py       # Flask app factory + error handlers
  main.py
```

## Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| Use-case | `verb_noun_usecase.py` | `predict_sentiment_usecase.py` |
| DTO | `XxxRequest`, `XxxResponse` (Pydantic) | `PredictSentimentRequest` |
| Port | `XxxRepository`, `XxxGateway` (Protocol) | `MLGateway` |
| Infra | `PostgresXxx`, `HttpXxx`, `LocalXxx` | `LocalMLGateway` |
| Controller | `noun_controller.py` | `prediction_controller.py` |
| Blueprint | `noun_bp.py` | `prediction_bp.py` |

## Code Templates

### Use-case with @log_action
```python
from ..ports.gateways.ml_gateway import MLGateway
from ..dtos.prediction_dto import PredictSentimentRequest, PredictSentimentResponse
from ...infrastructure.observability.decorators import log_action

class PredictSentimentUseCase:
    def __init__(self, ml_gateway: MLGateway) -> None:
        self._ml_gateway = ml_gateway

    @log_action
    def execute(self, request: PredictSentimentRequest) -> PredictSentimentResponse:
        result = self._ml_gateway.predict(request.text)
        return PredictSentimentResponse(sentiment=result.label, confidence=result.score)
```

### Port interface (Protocol)
```python
from typing import Protocol
from ...domain.value_objects.prediction import PredictionResult

class MLGateway(Protocol):
    def predict(self, text: str) -> PredictionResult: ...
```

### Controller with @log_action
```python
from flask import request, jsonify
from ...infrastructure.observability.decorators import log_action

class PredictionController:
    def __init__(self, predict_sentiment: PredictSentimentUseCase) -> None:
        self._predict_sentiment = predict_sentiment

    @log_action
    def predict(self):
        dto = PredictSentimentRequest.model_validate(request.get_json())
        result = self._predict_sentiment.execute(dto)
        return jsonify(present_prediction(result)), 200
```

### @log_action decorator (infrastructure/observability/decorators.py)
```python
import logging
import time
import functools

logger = logging.getLogger(__name__)

def log_action(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        class_name = args[0].__class__.__name__ if args else "?"
        method = func.__name__
        label = f"{class_name}.{method}"
        start = time.perf_counter()

        logger.info(f"→ {label}")
        try:
            result = func(*args, **kwargs)
            duration = round((time.perf_counter() - start) * 1000)
            logger.info(f"✓ {label} ({duration}ms)")
            return result
        except Exception as e:
            duration = round((time.perf_counter() - start) * 1000)
            logger.error(f"✗ {label} ({duration}ms): {e}")
            raise
    return wrapper
```

### Container
```python
class Container:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.pool = create_pool(settings)
        self.ml_gateway = LocalMLGateway(model_path=settings.MODEL_PATH)
        self.predict_sentiment = PredictSentimentUseCase(self.ml_gateway)
        self.prediction_controller = PredictionController(self.predict_sentiment)
```

## Gotchas
- Never create DB pools inside repositories — always inject
- Never import `container.py` from domain or application
- Use Pydantic for ALL DTOs — no raw dicts crossing boundaries
- Use `Protocol` for port interfaces (not ABC unless state needed)
- ML models: load once at startup, not per-request
- Type-hint everything — no `Any` unless absolutely necessary
- Use `@log_action` on every controller method and use-case `execute`
