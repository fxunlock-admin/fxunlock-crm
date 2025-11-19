""
Database module for the trading journal.

This module provides database connectivity and session management
for the trading journal application.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
from typing import Optional
import os

# Create base class for models
Base = declarative_base()

# Database connection string
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///trading_journal.db")

# Create database engine
engine = create_engine(
    DATABASE_URL,
    echo=bool(os.getenv("SQL_ECHO", "")),
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create scoped session factory
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

def get_db():
    ""
    Dependency to get DB session.
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    ""
    Initialize the database by creating all tables.
    """
    import trading_journal.models  # noqa: F401 - Import models to register them with SQLAlchemy
    Base.metadata.create_all(bind=engine)

# Import models after Base is defined to avoid circular imports
from .models import Trade, Broker, Portfolio  # noqa: E402, F401
