from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, Float, DateTime, ForeignKey, 
    Integer, JSON, Enum, Boolean, create_engine
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

from ..database import Base

class TradeType(str, PyEnum):
    BUY = "BUY"
    SELL = "SELL"


class TradeStatus(str, PyEnum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PENDING = "PENDING"


class Broker(Base):
    """Broker model to store information about different trading platforms."""
    __tablename__ = "brokers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    type = Column(String, nullable=False)  # e.g., "binance", "interactive_brokers"
    api_key = Column(String, nullable=True)  # Encrypted in production
    api_secret = Column(String, nullable=True)  # Encrypted in production
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata_ = Column("metadata", JSON, default=dict)
    
    # Relationships
    trades = relationship("Trade", back_populates="broker")
    portfolios = relationship("Portfolio", back_populates="broker")


class Trade(Base):
    """Trade model to store individual trades."""
    __tablename__ = "trades"

    id = Column(String, primary_key=True, index=True)
    broker_id = Column(String, ForeignKey("brokers.id"), nullable=False)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=True)
    symbol = Column(String, nullable=False)
    trade_type = Column(Enum(TradeType), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    fee = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(TradeStatus), default=TradeStatus.OPEN)
    notes = Column(String, default="")
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    broker = relationship("Broker", back_populates="trades")
    portfolio = relationship("Portfolio", back_populates="trades")


class Portfolio(Base):
    """Portfolio model to group trades and track performance."""
    __tablename__ = "portfolios"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    broker_id = Column(String, ForeignKey("brokers.id"), nullable=True)
    description = Column(String, default="")
    initial_balance = Column(Float, default=0.0)
    current_balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata_ = Column("metadata", JSON, default=dict)
    
    # Relationships
    broker = relationship("Broker", back_populates="portfolios")
    trades = relationship("Trade", back_populates="portfolio")


class PerformanceMetrics(Base):
    """Model to store calculated performance metrics for portfolios."""
    __tablename__ = "performance_metrics"
    
    id = Column(String, primary_key=True, index=True)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    total_return = Column(Float, default=0.0)
    daily_return = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    win_rate = Column(Float, nullable=True)
    profit_factor = Column(Float, nullable=True)
    metadata_ = Column("metadata", JSON, default=dict)
    
    # Relationships
    portfolio = relationship("Portfolio")


# Create all tables in the database
if __name__ == "__main__":
    from ..database import engine
    Base.metadata.create_all(bind=engine)
