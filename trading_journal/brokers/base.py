from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..models.trade import Trade, TradeType, TradeStatus


class BrokerInterface(ABC):
    """Abstract base class for all broker integrations."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Return the name of the broker."""
        pass
    
    @abstractmethod
    async def connect(self, credentials: Dict[str, str]) -> bool:
        """Connect to the broker's API.
        
        Args:
            credentials: Dictionary containing authentication details
            
        Returns:
            bool: True if connection was successful, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_trades(
        self, 
        symbol: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status: Optional[TradeStatus] = None
    ) -> List[Trade]:
        """Retrieve trades from the broker.
        
        Args:
            symbol: Filter trades by symbol
            start_date: Filter trades after this date
            end_date: Filter trades before this date
            status: Filter by trade status
            
        Returns:
            List of Trade objects
        """
        pass
    
    @abstractmethod
    async def get_balance(self) -> Dict[str, float]:
        """Get account balance information.
        
        Returns:
            Dictionary with balance information (e.g., {'USD': 1000.0, 'BTC': 0.5})
        """
        pass
    
    @abstractmethod
    async def get_positions(self) -> Dict[str, Dict[str, Any]]:
        """Get current open positions.
        
        Returns:
            Dictionary of positions with symbol as key and position details as value
        """
        pass
    
    @abstractmethod
    async def get_market_price(self, symbol: str) -> float:
        """Get current market price for a symbol.
        
        Args:
            symbol: Trading symbol (e.g., 'AAPL', 'BTC-USD')
            
        Returns:
            Current market price
        """
        pass
    
    @abstractmethod
    async def place_order(
        self,
        symbol: str,
        trade_type: TradeType,
        quantity: float,
        order_type: str = "market",
        limit_price: Optional[float] = None,
        stop_price: Optional[float] = None
    ) -> Trade:
        """Place a new order.
        
        Args:
            symbol: Trading symbol
            trade_type: BUY or SELL
            quantity: Number of units to trade
            order_type: Type of order (market, limit, stop, etc.)
            limit_price: Required for limit orders
            stop_price: Required for stop orders
            
        Returns:
            Trade object representing the placed order
        """
        pass


class BaseBroker(BrokerInterface):
    """Base implementation of the broker interface with common functionality."""
    
    def __init__(self, name: str):
        self._name = name
        self._connected = False
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def is_connected(self) -> bool:
        return self._connected
    
    async def connect(self, credentials: Dict[str, str]) -> bool:
        """Default connection implementation that just validates credentials."""
        if not all(key in credentials for key in self.required_credentials()):
            raise ValueError(f"Missing required credentials. Required: {self.required_credentials()}")
        self._connected = True
        return True
    
    @classmethod
    def required_credentials(cls) -> List[str]:
        """List of required credential keys for this broker."""
        return ["api_key", "api_secret"]
    
    def _format_symbol(self, symbol: str) -> str:
        """Format symbol according to broker's requirements."""
        return symbol.upper().strip()
    
    def _parse_timestamp(self, timestamp: str) -> datetime:
        """Parse timestamp string to datetime object."""
        # Default implementation, should be overridden by subclasses
        from datetime import datetime
        return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
