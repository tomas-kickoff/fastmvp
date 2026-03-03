# Python API — Layer Templates Reference

## Entity template

```python
# domain/entities/model_registry.py
from dataclasses import dataclass, field
from datetime import datetime
from ..errors.domain_error import DomainError


@dataclass
class ModelVersion:
    id: str
    model_name: str
    version: str
    status: str  # 'active' | 'deprecated' | 'training'
    accuracy: float | None
    created_at: datetime = field(default_factory=datetime.utcnow)

    def activate(self) -> None:
        if self.status == "active":
            raise DomainError("MODEL_ALREADY_ACTIVE", f"Model {self.id} is already active")
        if self.accuracy is None:
            raise DomainError("NO_ACCURACY", "Cannot activate model without accuracy metrics")
        self.status = "active"

    def deprecate(self) -> None:
        if self.status != "active":
            raise DomainError("MODEL_NOT_ACTIVE", "Only active models can be deprecated")
        self.status = "deprecated"
```

## Value Object template

```python
# domain/value_objects/prediction.py
from dataclasses import dataclass
from ..errors.domain_error import DomainError


@dataclass(frozen=True)
class PredictionResult:
    label: str
    score: float

    def __post_init__(self):
        if not 0.0 <= self.score <= 1.0:
            raise DomainError("INVALID_SCORE", f"Score must be between 0 and 1, got {self.score}")
        if not self.label:
            raise DomainError("EMPTY_LABEL", "Prediction label cannot be empty")
```

## Domain Error template

```python
# domain/errors/domain_error.py
class DomainError(Exception):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)
```

## Application Error template

```python
# application/errors/application_error.py
class ApplicationError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class NotFoundError(ApplicationError):
    def __init__(self, resource: str, id: str) -> None:
        super().__init__(
            code=f"{resource.upper()}_NOT_FOUND",
            message=f"{resource} with id {id} not found",
            status_code=404,
        )
```

## PostgreSQL Repository template

```python
# infrastructure/persistence/postgres/repositories/model_repository.py
from psycopg2.pool import ThreadedConnectionPool
from .....application.ports.repositories.model_repository import ModelRepository
from .....domain.entities.model_registry import ModelVersion


class PostgresModelRepository:
    def __init__(self, pool: ThreadedConnectionPool) -> None:
        self._pool = pool

    def save(self, model: ModelVersion) -> None:
        conn = self._pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO model_versions (id, model_name, version, status, accuracy, created_at)
                       VALUES (%s, %s, %s, %s, %s, %s)
                       ON CONFLICT (id) DO UPDATE SET status = %s, accuracy = %s""",
                    (model.id, model.model_name, model.version, model.status,
                     model.accuracy, model.created_at, model.status, model.accuracy),
                )
            conn.commit()
        finally:
            self._pool.putconn(conn)

    def find_by_id(self, id: str) -> ModelVersion | None:
        conn = self._pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM model_versions WHERE id = %s", (id,))
                row = cur.fetchone()
                return self._to_domain(row) if row else None
        finally:
            self._pool.putconn(conn)

    def _to_domain(self, row: tuple) -> ModelVersion:
        return ModelVersion(
            id=row[0],
            model_name=row[1],
            version=row[2],
            status=row[3],
            accuracy=row[4],
            created_at=row[5],
        )
```

## DB pool factory template

```python
# infrastructure/persistence/postgres/db.py
from psycopg2.pool import ThreadedConnectionPool
from ...config.env import Settings


def create_pool(settings: Settings) -> ThreadedConnectionPool:
    if settings.DATABASE_URL:
        return ThreadedConnectionPool(minconn=1, maxconn=10, dsn=settings.DATABASE_URL)

    return ThreadedConnectionPool(
        minconn=1,
        maxconn=10,
        host=settings.PGHOST,
        port=settings.PGPORT,
        user=settings.PGUSER,
        password=settings.PGPASSWORD,
        dbname=settings.PGDATABASE,
    )
```

## Presenter template

```python
# interfaces/http/presenters/prediction_presenter.py
from ....application.dtos.prediction_dto import PredictSentimentResponse


def present_prediction(result: PredictSentimentResponse) -> dict:
    return {
        "sentiment": result.sentiment,
        "confidence": result.confidence,
    }


def present_prediction_list(results: list[PredictSentimentResponse]) -> dict:
    return {
        "predictions": [present_prediction(r) for r in results],
        "total": len(results),
    }
```

## main.py template

```python
# main.py
from .infrastructure.config.env import Settings
from .app.container import Container
from .app.server import create_app


def main() -> None:
    settings = Settings()
    container = Container(settings)
    app = create_app(container)
    app.run(host="0.0.0.0", port=settings.PORT, debug=(settings.FLASK_ENV == "development"))


if __name__ == "__main__":
    main()
```
