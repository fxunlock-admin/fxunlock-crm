"""
Mock data generator for testing the trading journal dashboard
"""
from datetime import datetime, timedelta
import random
from typing import List, Dict
from .models.trade import Trade, TradeType, TradeStatus

class MockDataGenerator:
    """Generate realistic mock trading data for testing"""
    
    SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'ETHUSD', 'XAUUSD', 'AAPL', 'TSLA', 'GOOGL']
    BROKERS = ['binance', 'mt5', 'mt4']
    
    @staticmethod
    def generate_trades(broker_id: str, num_trades: int = 50) -> List[Trade]:
        """Generate random trades for a broker"""
        trades = []
        base_date = datetime.now() - timedelta(days=90)
        
        for i in range(num_trades):
            # Random trade parameters
            symbol = random.choice(MockDataGenerator.SYMBOLS)
            trade_type = random.choice([TradeType.BUY, TradeType.SELL])
            
            # Entry details
            entry_time = base_date + timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))
            entry_price = random.uniform(1.0, 50000.0)
            volume = random.uniform(0.01, 10.0)
            
            # Determine if trade is closed (80% closed, 20% open)
            is_closed = random.random() < 0.8
            
            if is_closed:
                # Closed trade
                exit_time = entry_time + timedelta(hours=random.randint(1, 72))
                
                # 60% winning trades, 40% losing
                is_winner = random.random() < 0.6
                
                if is_winner:
                    # Winning trade: 0.5% to 5% profit
                    profit_percent = random.uniform(0.005, 0.05)
                    exit_price = entry_price * (1 + profit_percent) if trade_type == TradeType.BUY else entry_price * (1 - profit_percent)
                else:
                    # Losing trade: 0.3% to 3% loss
                    loss_percent = random.uniform(0.003, 0.03)
                    exit_price = entry_price * (1 - loss_percent) if trade_type == TradeType.BUY else entry_price * (1 + loss_percent)
                
                status = TradeStatus.CLOSED
            else:
                # Open trade
                exit_time = None
                exit_price = None
                status = TradeStatus.OPEN
            
            # Create trade
            trade = Trade(
                id=f"{broker_id}_{i+1}_{int(entry_time.timestamp())}",
                broker_id=broker_id,
                symbol=symbol,
                type=trade_type,
                quantity=volume,
                entry_price=entry_price,
                exit_price=exit_price,
                entry_time=entry_time,
                exit_time=exit_time,
                status=status,
                commission=random.uniform(0.5, 5.0),
                swap=random.uniform(-2.0, 2.0) if is_closed else 0.0,
                notes=f"Mock trade #{i+1} for {broker_id}"
            )
            
            # Calculate PnL for closed trades
            if is_closed:
                trade.pnl, trade.pnl_percent = trade.calculate_pnl()
            
            trades.append(trade)
        
        return trades
    
    @staticmethod
    def generate_balance(broker_id: str) -> Dict:
        """Generate mock balance data for a broker"""
        base_balance = random.uniform(5000, 50000)
        equity = base_balance + random.uniform(-1000, 2000)
        
        return {
            'balance': round(base_balance, 2),
            'equity': round(equity, 2),
            'margin': round(random.uniform(100, 1000), 2),
            'free_margin': round(equity - random.uniform(100, 1000), 2),
            'margin_level': round(random.uniform(200, 1000), 2),
            'currency': 'USD'
        }
    
    @staticmethod
    def generate_positions(broker_id: str, num_positions: int = 5) -> List[Dict]:
        """Generate mock open positions"""
        positions = []
        
        for i in range(num_positions):
            symbol = random.choice(MockDataGenerator.SYMBOLS)
            position_type = random.choice(['buy', 'sell'])
            entry_price = random.uniform(1.0, 50000.0)
            current_price = entry_price * random.uniform(0.98, 1.02)
            volume = random.uniform(0.01, 5.0)
            
            # Calculate P&L
            if position_type == 'buy':
                pnl = (current_price - entry_price) * volume
            else:
                pnl = (entry_price - current_price) * volume
            
            positions.append({
                'symbol': symbol,
                'type': position_type,
                'volume': round(volume, 2),
                'entry_price': round(entry_price, 2),
                'current_price': round(current_price, 2),
                'pnl': round(pnl, 2),
                'swap': round(random.uniform(-5, 5), 2),
                'commission': round(random.uniform(1, 10), 2)
            })
        
        return positions
    
    @staticmethod
    def get_all_mock_data() -> Dict:
        """Generate complete mock data for all brokers"""
        mock_data = {
            'trades': {},
            'balances': {},
            'positions': {}
        }
        
        for broker in MockDataGenerator.BROKERS:
            # Generate different number of trades per broker
            num_trades = random.randint(40, 80)
            mock_data['trades'][broker] = MockDataGenerator.generate_trades(broker, num_trades)
            mock_data['balances'][broker] = MockDataGenerator.generate_balance(broker)
            mock_data['positions'][broker] = MockDataGenerator.generate_positions(broker, random.randint(3, 8))
        
        return mock_data


# Global mock data instance
_mock_data = None

def get_mock_data() -> Dict:
    """Get or create mock data singleton"""
    global _mock_data
    if _mock_data is None:
        _mock_data = MockDataGenerator.get_all_mock_data()
    return _mock_data

def reset_mock_data():
    """Reset mock data (generate new random data)"""
    global _mock_data
    _mock_data = MockDataGenerator.get_all_mock_data()
    return _mock_data
