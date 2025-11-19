import aiohttp
from datetime import datetime, timedelta
from typing import List, Optional
from ..models.trade import Trade, TradeStatus, TradeType
from .base import BrokerBase

class MT4Broker(BrokerBase):
    """
    MetaTrader 4 broker implementation.
    
    Note: MT4 doesn't have native Python API. This implementation assumes
    you have a REST API bridge (like MT4 REST API or custom bridge) running.
    Alternatively, you can parse MT4 history files directly.
    """
    
    def __init__(self, api_url: str, account: int, password: str):
        super().__init__(str(account), password)
        self.api_url = api_url
        self.account = account
        self.session = None

    async def connect(self) -> bool:
        """Establish connection to MT4 via REST API."""
        try:
            self.session = aiohttp.ClientSession()
            
            # Test connection with a simple request
            async with self.session.get(
                f"{self.api_url}/account",
                params={"account": self.account}
            ) as response:
                if response.status == 200:
                    self.connected = True
                    return True
                else:
                    print(f"MT4 connection failed with status {response.status}")
                    return False
        except Exception as e:
            print(f"Failed to connect to MT4: {e}")
            self.connected = False
            return False

    async def disconnect(self) -> None:
        """Close connection to MT4."""
        if self.session:
            await self.session.close()
        self.connected = False

    async def get_trades(
        self, 
        symbol: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        status: Optional[TradeStatus] = None
    ) -> List[Trade]:
        """Retrieve trades from MT4 via REST API."""
        if not self.connected:
            await self.connect()

        trades = []
        try:
            params = {
                "account": self.account,
                "from": int(start_time.timestamp()) if start_time else int((datetime.now() - timedelta(days=30)).timestamp()),
                "to": int(end_time.timestamp()) if end_time else int(datetime.now().timestamp())
            }
            
            if symbol:
                params["symbol"] = symbol
            
            async with self.session.get(f"{self.api_url}/trades", params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    for trade_data in data.get('trades', []):
                        trade_type = TradeType.BUY if trade_data['type'] == 'buy' else TradeType.SELL
                        trade_status = TradeStatus.CLOSED if trade_data.get('close_time') else TradeStatus.OPEN
                        
                        trade = Trade(
                            id=f"mt4_{trade_data['ticket']}",
                            broker_id="mt4",
                            symbol=trade_data['symbol'],
                            type=trade_type,
                            status=trade_status,
                            quantity=float(trade_data['volume']),
                            entry_price=float(trade_data['open_price']),
                            exit_price=float(trade_data['close_price']) if trade_data.get('close_price') else None,
                            entry_time=datetime.fromtimestamp(trade_data['open_time']),
                            exit_time=datetime.fromtimestamp(trade_data['close_time']) if trade_data.get('close_time') else None,
                            commission=float(trade_data.get('commission', 0)),
                            swap=float(trade_data.get('swap', 0)),
                            pnl=float(trade_data.get('profit', 0)),
                            metadata={
                                "ticket": trade_data['ticket'],
                                "magic": trade_data.get('magic', 0),
                                "comment": trade_data.get('comment', '')
                            }
                        )
                        
                        if trade.exit_price:
                            trade.pnl, trade.pnl_percent = trade.calculate_pnl()
                        
                        trades.append(trade)
                        
        except Exception as e:
            print(f"Error fetching trades from MT4: {e}")
            
        return trades

    async def get_balance(self) -> dict:
        """Get account balance from MT4."""
        if not self.connected:
            await self.connect()
            
        try:
            async with self.session.get(
                f"{self.api_url}/account",
                params={"account": self.account}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "total": {
                            "USD": float(data.get('balance', 0))
                        },
                        "free": {
                            "USD": float(data.get('free_margin', 0))
                        },
                        "used": {
                            "USD": float(data.get('margin', 0))
                        },
                        "equity": float(data.get('equity', 0)),
                        "profit": float(data.get('profit', 0))
                    }
        except Exception as e:
            print(f"Error fetching balance from MT4: {e}")
            return {}

    async def get_positions(self) -> List[dict]:
        """Get current open positions from MT4."""
        if not self.connected:
            await self.connect()
            
        try:
            async with self.session.get(
                f"{self.api_url}/positions",
                params={"account": self.account}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return [
                        {
                            'symbol': p['symbol'],
                            'size': float(p['volume']),
                            'entry_price': float(p['open_price']),
                            'mark_price': float(p['current_price']),
                            'unrealized_pnl': float(p['profit']),
                            'side': 'long' if p['type'] == 'buy' else 'short',
                            'swap': float(p.get('swap', 0)),
                            'commission': float(p.get('commission', 0)),
                            'ticket': p['ticket']
                        }
                        for p in data.get('positions', [])
                    ]
        except Exception as e:
            print(f"Error fetching positions from MT4: {e}")
            return []

    async def get_market_data(self, symbol: str) -> dict:
        """Get current market data for a symbol from MT4."""
        if not self.connected:
            await self.connect()
            
        try:
            async with self.session.get(
                f"{self.api_url}/market/{symbol}",
                params={"account": self.account}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'symbol': symbol,
                        'last': float(data.get('last', 0)),
                        'bid': float(data.get('bid', 0)),
                        'ask': float(data.get('ask', 0)),
                        'volume': float(data.get('volume', 0)),
                        'timestamp': datetime.now()
                    }
        except Exception as e:
            print(f"Error fetching market data from MT4 for {symbol}: {e}")
            return {'symbol': symbol}
