"""
Mock broker implementation for testing
"""
from typing import List, Dict, Optional
from datetime import datetime
from .base import BrokerBase
from ..models.trade import Trade

class MockBroker(BrokerBase):
    """Mock broker that returns pre-generated data"""
    
    def __init__(self, broker_id: str, trades: List[Trade], balance: Dict, positions: List[Dict]):
        self.broker_id = broker_id
        self._trades = trades
        self._balance = balance
        self._positions = positions
        self._connected = False
    
    async def connect(self) -> bool:
        """Simulate connection"""
        self._connected = True
        return True
    
    async def disconnect(self) -> bool:
        """Simulate disconnection"""
        self._connected = False
        return True
    
    async def get_trades(
        self,
        symbol: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Trade]:
        """Return mock trades with optional filtering"""
        trades = self._trades
        
        if symbol:
            trades = [t for t in trades if t.symbol == symbol]
        
        if start_time:
            trades = [t for t in trades if t.entry_time >= start_time]
        
        if end_time:
            trades = [t for t in trades if t.entry_time <= end_time]
        
        return trades
    
    async def get_balance(self) -> Dict:
        """Return mock balance"""
        return self._balance
    
    async def get_positions(self) -> List[Dict]:
        """Return mock open positions"""
        return self._positions
    
    async def get_market_data(self, symbol: str) -> Dict:
        """Return mock market data"""
        import random
        base_price = random.uniform(1.0, 50000.0)
        
        return {
            'symbol': symbol,
            'bid': round(base_price * 0.9999, 5),
            'ask': round(base_price * 1.0001, 5),
            'last': round(base_price, 5),
            'volume': round(random.uniform(1000, 100000), 2),
            'timestamp': datetime.now()
        }
