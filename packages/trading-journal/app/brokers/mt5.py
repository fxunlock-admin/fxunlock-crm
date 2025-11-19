import MetaTrader5 as mt5
from datetime import datetime, timedelta
from typing import List, Optional
from ..models.trade import Trade, TradeStatus, TradeType
from .base import BrokerBase

class MT5Broker(BrokerBase):
    """MetaTrader 5 broker implementation."""
    
    def __init__(self, account: int, password: str, server: str):
        # MT5 doesn't use traditional API keys
        super().__init__(str(account), password)
        self.account = account
        self.password = password
        self.server = server

    async def connect(self) -> bool:
        """Establish connection to MT5."""
        try:
            if not mt5.initialize():
                print(f"MT5 initialize() failed, error code = {mt5.last_error()}")
                return False
            
            authorized = mt5.login(self.account, password=self.password, server=self.server)
            if not authorized:
                print(f"MT5 login failed, error code = {mt5.last_error()}")
                mt5.shutdown()
                return False
            
            self.connected = True
            return True
        except Exception as e:
            print(f"Failed to connect to MT5: {e}")
            self.connected = False
            return False

    async def disconnect(self) -> None:
        """Close connection to MT5."""
        if self.connected:
            mt5.shutdown()
        self.connected = False

    async def get_trades(
        self, 
        symbol: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        status: Optional[TradeStatus] = None
    ) -> List[Trade]:
        """Retrieve trades from MT5 history."""
        if not self.connected:
            await self.connect()

        trades = []
        try:
            # Get deals from history
            from_date = start_time or datetime.now() - timedelta(days=30)
            to_date = end_time or datetime.now()
            
            deals = mt5.history_deals_get(from_date, to_date)
            
            if deals is None:
                print(f"No deals found, error code = {mt5.last_error()}")
                return trades
            
            # Group deals by position to create trades
            position_deals = {}
            for deal in deals:
                if deal.entry == mt5.DEAL_ENTRY_IN or deal.entry == mt5.DEAL_ENTRY_OUT:
                    pos_id = deal.position_id
                    if pos_id not in position_deals:
                        position_deals[pos_id] = []
                    position_deals[pos_id].append(deal)
            
            # Convert position deals to Trade objects
            for pos_id, deal_list in position_deals.items():
                if not deal_list:
                    continue
                
                # Sort by time
                deal_list.sort(key=lambda x: x.time)
                
                entry_deal = deal_list[0]
                exit_deal = deal_list[-1] if len(deal_list) > 1 else None
                
                # Filter by symbol if specified
                if symbol and entry_deal.symbol != symbol:
                    continue
                
                trade_type = TradeType.BUY if entry_deal.type == mt5.DEAL_TYPE_BUY else TradeType.SELL
                trade_status = TradeStatus.CLOSED if exit_deal else TradeStatus.OPEN
                
                # Calculate PnL
                pnl = sum([d.profit for d in deal_list])
                commission = sum([d.commission for d in deal_list])
                swap = sum([d.swap for d in deal_list])
                
                trade = Trade(
                    id=f"mt5_{pos_id}",
                    broker_id="mt5",
                    symbol=entry_deal.symbol,
                    type=trade_type,
                    status=trade_status,
                    quantity=entry_deal.volume,
                    entry_price=entry_deal.price,
                    exit_price=exit_deal.price if exit_deal else None,
                    entry_time=datetime.fromtimestamp(entry_deal.time),
                    exit_time=datetime.fromtimestamp(exit_deal.time) if exit_deal else None,
                    commission=commission,
                    swap=swap,
                    pnl=pnl,
                    metadata={
                        "position_id": pos_id,
                        "magic": entry_deal.magic,
                        "comment": entry_deal.comment
                    }
                )
                
                # Calculate PnL percentage
                if trade.exit_price:
                    trade.pnl, trade.pnl_percent = trade.calculate_pnl()
                
                trades.append(trade)
                
        except Exception as e:
            print(f"Error fetching trades from MT5: {e}")
            
        return trades

    async def get_balance(self) -> dict:
        """Get account balance from MT5."""
        if not self.connected:
            await self.connect()
            
        try:
            account_info = mt5.account_info()
            if account_info is None:
                print(f"Failed to get account info, error code = {mt5.last_error()}")
                return {}
            
            return {
                "total": {
                    "USD": account_info.balance
                },
                "free": {
                    "USD": account_info.margin_free
                },
                "used": {
                    "USD": account_info.margin
                },
                "equity": account_info.equity,
                "profit": account_info.profit,
                "margin_level": account_info.margin_level if account_info.margin > 0 else 0
            }
        except Exception as e:
            print(f"Error fetching balance from MT5: {e}")
            return {}

    async def get_positions(self) -> List[dict]:
        """Get current open positions from MT5."""
        if not self.connected:
            await self.connect()
            
        try:
            positions = mt5.positions_get()
            if positions is None:
                print(f"No positions found, error code = {mt5.last_error()}")
                return []
            
            return [
                {
                    'symbol': p.symbol,
                    'size': p.volume,
                    'entry_price': p.price_open,
                    'mark_price': p.price_current,
                    'unrealized_pnl': p.profit,
                    'side': 'long' if p.type == mt5.POSITION_TYPE_BUY else 'short',
                    'swap': p.swap,
                    'commission': 0,  # MT5 doesn't provide commission in position
                    'time': datetime.fromtimestamp(p.time).isoformat(),
                    'ticket': p.ticket
                }
                for p in positions
            ]
        except Exception as e:
            print(f"Error fetching positions from MT5: {e}")
            return []

    async def get_market_data(self, symbol: str) -> dict:
        """Get current market data for a symbol from MT5."""
        if not self.connected:
            await self.connect()
            
        try:
            tick = mt5.symbol_info_tick(symbol)
            if tick is None:
                print(f"Failed to get tick for {symbol}, error code = {mt5.last_error()}")
                return {'symbol': symbol}
            
            return {
                'symbol': symbol,
                'last': tick.last,
                'bid': tick.bid,
                'ask': tick.ask,
                'volume': tick.volume,
                'timestamp': datetime.fromtimestamp(tick.time)
            }
        except Exception as e:
            print(f"Error fetching market data from MT5 for {symbol}: {e}")
            return {'symbol': symbol}
