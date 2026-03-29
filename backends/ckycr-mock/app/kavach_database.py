"""Separate Kavach metadata database (no raw PII)."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class KavachBase(DeclarativeBase):
    pass


def _kavach_connect_args(url: str) -> dict:
    if url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


kavach_engine = create_engine(
    settings.kavach_database_url,
    connect_args=_kavach_connect_args(settings.kavach_database_url),
)
KavachSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=kavach_engine)


def get_kavach_db() -> Generator[Session, None, None]:
    db = KavachSessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_kavach_db() -> None:
    from app import kavach_models  # noqa: F401

    KavachBase.metadata.create_all(bind=kavach_engine)
