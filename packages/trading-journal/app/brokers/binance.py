import ccxt.async_support as ccxt
from datetime import datetime
from typing import List, Optional
from ..models.trade import Trade, TradeStatus, TradeType
from .base import BrokerBase

class BinanceBroker(BrokerBase):
    """Binance exchange broker implementation."""
    
    def __init__(self, api_key: str, api_secret: str):
        super().__init__(api_key, api_secret)
        self.exchange = ccxt.binance({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
            'options': {
                'defaultType': 'future',  # or 'spot' for spot trading
                'adjustForTimeDifference': True,
            }
        })

    async def connect(self) -> bool:
        """Establish connection to Binance API."""
        try:
            await self.exchange.load_markets()
            self.connected = True
            return True
        except Exception as e:
            print(f"Failed to connect to Binance: {e}")
            self.connected = False
            return False

    async def disconnect(self) -> None:
        """Close connection to Binance API."""
        if hasattr(self, 'exchange') and self.exchange.session:
            await self.exchange.close()
        self.connected = False

    async def get_trades(
        self, 
        symbol: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        status: Optional[TradeStatus] = None
    ) -> List[Trade]:
        """Retrieve trades from Binance."""
        if not self.connected:
            await self.connect()

        params = {}
        if start_time:
            params['startTime'] = int(start_time.timestamp() * 1000)
        if end_time:
            params['endTime'] = int(end_time.timestamp() * 1000)

        trades = []
        try:
            # This is a simplified example - you'd need to map Binance's trade format to our Trade model
            raw_trades = await self.exchange.fetch_my_trades(symbol, params=params)
            
            for trade in raw_trades:
                trade_type = TradeType.BUY if trade['side'] == 'buy' else TradeType.SELL
                trades.append(Trade(
                    id=str(trade['id']),
                    broker_id='binance',
                    symbol=trade['symbol'],
                    type=trade_type,
                    status=TradeStatus.CLOSED,  # Binance trades are always closed
                    quantity=float(trade['amount']),
                    entry_price=float(trade['price']),
                    exit_price=float(trade['price']),
                    entry_time=datetime.fromtimestamp(trade['timestamp'] / 1000),
                    exit_time=datetime.fromtimestamp(trade['timestamp'] / 1000),
                    commission=float(trade['fee']['cost']) if trade.get('fee') else 0.0,
                    pnl=float(trade.get('realizedPnl', 0)),
                ))
                
        except Exception as e:
            print(f"Error fetching trades from Binance: {e}")
            
        return trades

    async def get_balance(self) -> dict:
        """Get account balance from Binance."""
        if not self.connected:
            await self.connect()
            
        try:
            balance = await self.exchange.fetch_balance()
            return {
                'total': {k: v for k, v in balance['total'].items() if v > 0},
                'free': {k: v for k, v in balance['free'].items() if v > 0},
                'used': {k: v for k, v in balance['used'].items() if v > 0},
            }
        except Exception as e:
            print(f"Error fetching balance from Binance: {e}")
            return {}

    async def get_positions(self) -> List[dict]:
        """Get current open positions from Binance."""
        if not self.connected:
            await self.connect()
            
        try:
            positions = await self.exchange.fetch_positions()
            return [
                {
                    'symbol': p['symbol'],
                    'size': float(p['contracts']),
                    'entry_price': float(p['entryPrice']),
                    'leverage': float(p['leverage']),
                    'liquidation_price': float(p['liquidationPrice']) if p['liquidationPrice'] else None,
                    'mark_price': float(p['markPrice']),
                    'unrealized_pnl': float(p['unrealizedPnl']),
                    'side': p['side']
                }
                for p in positions if float(p['contracts']) > 0
            ]
        except Exception as e:
            print(f"Error fetching positions from Binance: {e}")
            return []

    async def get_market_data(self, symbol: str) -> dict:
        """Get current market data for a symbol from Binance."""
        if not self.connected:
            await self.connect()
            
        try:
            ticker = await self.exchange.fetch_ticker(symbol)
            return {
                'symbol': symbol,
                'last': float(ticker['last']) if ticker['last'] else None,
                'bid': float(ticker['bid']) if ticker['bid'] else None,
                'ask': float(ticker['ask']) if ticker['ask'] else None,
                'volume': float(ticker['baseVolume']) if ticker['baseVolume'] else None,
                'timestamp': datetime.fromtimestamp(ticker['timestamp'] / 1000) if ticker['timestamp'] else None
            }
        except Exception as e:
            print(f"Error fetching market data from Binance for {symbol}: {e}")
            return {'symbol': symbol}
