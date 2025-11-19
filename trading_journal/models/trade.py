from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class TradeType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class TradeStatus(str, Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    PENDING = "PENDING"


class Trade(BaseModel):
    """Represents a single trade in the trading journal."""
    id: str = Field(..., description="Unique identifier for the trade")
    broker_id: str = Field(..., description="ID of the broker where the trade was executed")
    symbol: str = Field(..., description="Trading symbol (e.g., AAPL, BTC-USD)")
    trade_type: TradeType = Field(..., description="Type of trade (BUY/SELL)")
    quantity: float = Field(..., gt=0, description="Number of units traded")
    price: float = Field(..., gt=0, description="Price per unit")
    fee: float = Field(default=0.0, ge=0, description="Trading fee")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the trade was executed")
    status: TradeStatus = Field(default=TradeStatus.OPEN, description="Current status of the trade")
    notes: str = Field(default="", description="Additional notes about the trade")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional trade metadata")
    
    @property
    def cost(self) -> float:
        """Calculate the total cost of the trade (including fees)."""
        base_cost = self.quantity * self.price
        return base_cost + self.fee if self.trade_type == TradeType.BUY else base_cost - self.fee
    
    def close(self, price: float, fee: float = 0.0) -> 'Trade':
        """Create a closing trade for this position."""
        if self.trade_type == TradeType.SELL:
            raise ValueError("Cannot close a SELL trade")
            
        return Trade(
            broker_id=self.broker_id,
            symbol=self.symbol,
            trade_type=TradeType.SELL,
            quantity=self.quantity,
            price=price,
            fee=fee,
            status=TradeStatus.CLOSED
        )


class TradeUpdate(BaseModel):
    """Schema for updating trade information."""
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
