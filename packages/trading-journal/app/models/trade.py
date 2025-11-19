from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TradeType(str, Enum):
    BUY = "buy"
    SELL = "sell"

class TradeStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    CANCELLED = "cancelled"

class Trade(BaseModel):
    id: str
    broker_id: str
    symbol: str
    type: TradeType
    status: TradeStatus = TradeStatus.OPEN
    quantity: float
    entry_price: float
    exit_price: Optional[float] = None
    entry_time: datetime
    exit_time: Optional[datetime] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    commission: float = 0.0
    swap: float = 0.0
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def calculate_pnl(self) -> tuple[float, float]:
        """Calculate profit/loss and percentage return."""
        if self.exit_price is None or self.entry_price is None:
            return 0.0, 0.0
            
        if self.type == TradeType.BUY:
            pnl = (self.exit_price - self.entry_price) * self.quantity
        else:  # SELL
            pnl = (self.entry_price - self.exit_price) * self.quantity
            
        pnl -= (self.commission + self.swap)
        pnl_percent = (pnl / (self.entry_price * self.quantity)) * 100
        
        return pnl, pnl_percent

    def close_trade(self, exit_price: float, exit_time: Optional[datetime] = None) -> None:
        """Close the trade with the given exit price and time."""
        self.exit_price = exit_price
        self.exit_time = exit_time or datetime.utcnow()
        self.status = TradeStatus.CLOSED
        self.pnl, self.pnl_percent = self.calculate_pnl()
        self.updated_at = datetime.utcnow()
