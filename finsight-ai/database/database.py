"""
FinSight AI — Database Connection & Session Management
Initializes SQLite database engine and provides transactional sessions.
"""

import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# Database file location (defaults to finsight.db in root or current dir)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.environ.get("FINSIGHT_DB_PATH", os.path.join(BASE_DIR, "finsight.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create SQLite engine with thread-safety enabled for Streamlit
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Session factory bound to engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """
    Creates all relational tables defined in models.py if they do not already exist.
    Safe to call repeatedly on startup.
    """
    Base.metadata.create_all(bind=engine)


@contextmanager
def get_db():
    """
    Context manager providing a transactional scope around a series of operations.
    Automatically commits on success or rolls back on exception.
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
