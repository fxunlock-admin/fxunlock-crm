from typing import Dict, List, Optional
from datetime import datetime, timedelta
import pandas as pd
from ..models.trade import Trade, TradeStatus
from .risk_metrics import RiskMetrics

class CrossBrokerAnalytics:
    """Aggregate and analyze data across multiple brokers."""
    
    def __init__(self):
        self.risk_calculator = RiskMetrics()
    
    def aggregate_trades(self, broker_trades: Dict[str, List[Trade]]) -> List[Trade]:
        """Combine trades from all brokers."""
        all_trades = []
        for broker_id, trades in broker_trades.items():
            all_trades.extend(trades)
        return all_trades
    
    def calculate_consolidated_stats(
        self, 
        broker_trades: Dict[str, List[Trade]],
        broker_positions: Dict[str, List[Dict]],
        broker_balances: Dict[str, Dict]
    ) -> Dict:
        """Calculate consolidated statistics across all brokers."""
        
        all_trades = self.aggregate_trades(broker_trades)
        
        # Calculate total PnL
        total_pnl = sum([t.pnl or 0 for t in all_trades if t.status == TradeStatus.CLOSED])
        
        # Calculate risk metrics
        max_dd = self.risk_calculator.calculate_max_drawdown(all_trades)
        win_rate_stats = self.risk_calculator.calculate_win_rate(all_trades)
        sharpe = self.risk_calculator.calculate_sharpe_ratio(all_trades)
        expectancy = self.risk_calculator.calculate_expectancy(all_trades)
        var_95 = self.risk_calculator.calculate_var(all_trades, 0.95)
        
        # Aggregate positions
        all_positions = []
        for positions in broker_positions.values():
            all_positions.extend(positions)
        
        open_risk = self.risk_calculator.calculate_open_risk(all_positions)
        
        # Calculate total balance
        total_balance = 0.0
        for balance in broker_balances.values():
            if isinstance(balance, dict) and 'total' in balance:
                # Sum all currency values (simplified - in reality you'd convert to base currency)
                total_balance += sum(balance['total'].values())
        
        return {
            "total_pnl": total_pnl,
            "total_balance": total_balance,
            "total_trades": len([t for t in all_trades if t.status == TradeStatus.CLOSED]),
            "open_positions": len(all_positions),
            "win_rate": win_rate_stats['win_rate'],
            "profit_factor": win_rate_stats['profit_factor'],
            "sharpe_ratio": sharpe,
            "expectancy": expectancy,
            "max_drawdown": max_dd['max_drawdown'],
            "max_drawdown_percent": max_dd['max_drawdown_percent'],
            "var_95": var_95,
            "open_risk": open_risk['total_open_risk'],
            "unrealized_pnl": open_risk['total_unrealized_pnl'],
            "avg_win": win_rate_stats['avg_win'],
            "avg_loss": win_rate_stats['avg_loss'],
            "winning_trades": win_rate_stats['winning_trades'],
            "losing_trades": win_rate_stats['losing_trades']
        }
    
    def compare_broker_performance(
        self, 
        broker_trades: Dict[str, List[Trade]],
        broker_balances: Dict[str, Dict]
    ) -> List[Dict]:
        """Compare performance metrics across brokers."""
        
        broker_stats = []
        
        for broker_id, trades in broker_trades.items():
            closed_trades = [t for t in trades if t.status == TradeStatus.CLOSED]
            
            total_pnl = sum([t.pnl or 0 for t in closed_trades])
            win_rate_stats = self.risk_calculator.calculate_win_rate(trades)
            max_dd = self.risk_calculator.calculate_max_drawdown(trades)
            sharpe = self.risk_calculator.calculate_sharpe_ratio(trades)
            
            # Get balance for this broker
            balance = 0.0
            if broker_id in broker_balances:
                broker_balance = broker_balances[broker_id]
                if isinstance(broker_balance, dict) and 'total' in broker_balance:
                    balance = sum(broker_balance['total'].values())
            
            broker_stats.append({
                "broker_id": broker_id,
                "total_pnl": total_pnl,
                "balance": balance,
                "total_trades": len(closed_trades),
                "win_rate": win_rate_stats['win_rate'],
                "profit_factor": win_rate_stats['profit_factor'],
                "sharpe_ratio": sharpe,
                "max_drawdown_percent": max_dd['max_drawdown_percent'],
                "avg_win": win_rate_stats['avg_win'],
                "avg_loss": win_rate_stats['avg_loss']
            })
        
        # Sort by total PnL
        broker_stats.sort(key=lambda x: x['total_pnl'], reverse=True)
        
        return broker_stats
    
    def get_performance_timeline(
        self, 
        broker_trades: Dict[str, List[Trade]],
        period: str = "daily"
    ) -> Dict:
        """Get performance timeline aggregated by period (daily, weekly, monthly)."""
        
        all_trades = self.aggregate_trades(broker_trades)
        closed_trades = [t for t in all_trades if t.status == TradeStatus.CLOSED and t.exit_time]
        
        if not closed_trades:
            return {"dates": [], "cumulative_pnl": [], "daily_pnl": []}
        
        # Create DataFrame for easier time-based aggregation
        df = pd.DataFrame([
            {
                "date": t.exit_time,
                "pnl": t.pnl or 0,
                "broker": t.broker_id
            }
            for t in closed_trades
        ])
        
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Resample based on period
        if period == "daily":
            freq = 'D'
        elif period == "weekly":
            freq = 'W'
        elif period == "monthly":
            freq = 'M'
        else:
            freq = 'D'
        
        # Group by period and sum PnL
        grouped = df.groupby(pd.Grouper(key='date', freq=freq))['pnl'].sum()
        
        # Calculate cumulative PnL
        cumulative_pnl = grouped.cumsum()
        
        return {
            "dates": [d.isoformat() for d in grouped.index],
            "period_pnl": grouped.tolist(),
            "cumulative_pnl": cumulative_pnl.tolist()
        }
    
    def get_symbol_performance(self, broker_trades: Dict[str, List[Trade]]) -> List[Dict]:
        """Analyze performance by trading symbol."""
        
        all_trades = self.aggregate_trades(broker_trades)
        closed_trades = [t for t in all_trades if t.status == TradeStatus.CLOSED]
        
        # Group by symbol
        symbol_stats = {}
        for trade in closed_trades:
            symbol = trade.symbol
            if symbol not in symbol_stats:
                symbol_stats[symbol] = []
            symbol_stats[symbol].append(trade)
        
        # Calculate stats for each symbol
        results = []
        for symbol, trades in symbol_stats.items():
            total_pnl = sum([t.pnl or 0 for t in trades])
            win_rate_stats = self.risk_calculator.calculate_win_rate(trades)
            
            results.append({
                "symbol": symbol,
                "total_pnl": total_pnl,
                "total_trades": len(trades),
                "win_rate": win_rate_stats['win_rate'],
                "profit_factor": win_rate_stats['profit_factor'],
                "avg_win": win_rate_stats['avg_win'],
                "avg_loss": win_rate_stats['avg_loss']
            })
        
        # Sort by total PnL
        results.sort(key=lambda x: x['total_pnl'], reverse=True)
        
        return results
