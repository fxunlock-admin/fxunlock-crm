from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from ..models.trade import Trade, TradeStatus

class BrokerBase(ABC):
    """Base class for all broker implementations."""
    
    def __init__(self, api_key: str, api_secret: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.connected = False

    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection to the broker's API."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection to the broker's API."""
        pass

    @abstractmethod
    async def get_trades(
        self, 
        symbol: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        status: Optional[TradeStatus] = None
    ) -> List[Trade]:
        """Retrieve trades from the broker."""
        pass

    @abstractmethod
    async def get_balance(self) -> dict:
        """Get account balance."""
        pass

    @abstractmethod
    async def get_positions(self) -> List[dict]:
        """Get current open positions."""
        pass

    @abstractmethod
    async def get_market_data(self, symbol: str) -> dict:
        """Get current market data for a symbol."""
        pass
