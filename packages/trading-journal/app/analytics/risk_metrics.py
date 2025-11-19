import numpy as np
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from ..models.trade import Trade, TradeStatus

class RiskMetrics:
    """Calculate comprehensive risk metrics for trading accounts."""
    
    @staticmethod
    def calculate_max_drawdown(trades: List[Trade]) -> Dict[str, float]:
        """Calculate maximum drawdown from trade history."""
        if not trades:
            return {"max_drawdown": 0.0, "max_drawdown_percent": 0.0, "duration_days": 0}
        
        # Sort trades by exit time
        closed_trades = [t for t in trades if t.status == TradeStatus.CLOSED and t.exit_time]
        closed_trades.sort(key=lambda x: x.exit_time)
        
        if not closed_trades:
            return {"max_drawdown": 0.0, "max_drawdown_percent": 0.0, "duration_days": 0}
        
        # Calculate cumulative PnL
        cumulative_pnl = []
        running_pnl = 0
        for trade in closed_trades:
            running_pnl += trade.pnl or 0
            cumulative_pnl.append(running_pnl)
        
        # Find maximum drawdown
        peak = cumulative_pnl[0]
        max_dd = 0
        max_dd_percent = 0
        dd_start_idx = 0
        dd_end_idx = 0
        
        for i, pnl in enumerate(cumulative_pnl):
            if pnl > peak:
                peak = pnl
            dd = peak - pnl
            if dd > max_dd:
                max_dd = dd
                dd_end_idx = i
                # Find the peak before this drawdown
                for j in range(i, -1, -1):
                    if cumulative_pnl[j] == peak:
                        dd_start_idx = j
                        break
        
        # Calculate drawdown percentage
        if peak > 0:
            max_dd_percent = (max_dd / peak) * 100
        
        # Calculate duration
        duration_days = 0
        if dd_start_idx < len(closed_trades) and dd_end_idx < len(closed_trades):
            start_time = closed_trades[dd_start_idx].exit_time
            end_time = closed_trades[dd_end_idx].exit_time
            if start_time and end_time:
                duration_days = (end_time - start_time).days
        
        return {
            "max_drawdown": max_dd,
            "max_drawdown_percent": max_dd_percent,
            "duration_days": duration_days
        }
    
    @staticmethod
    def calculate_sharpe_ratio(trades: List[Trade], risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe ratio from trade returns."""
        if not trades:
            return 0.0
        
        returns = [t.pnl_percent or 0 for t in trades if t.status == TradeStatus.CLOSED and t.pnl_percent is not None]
        
        if not returns or len(returns) < 2:
            return 0.0
        
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        
        if std_return == 0:
            return 0.0
        
        # Annualized Sharpe ratio (assuming daily returns)
        sharpe = (mean_return - risk_free_rate) / std_return * np.sqrt(252)
        return sharpe
    
    @staticmethod
    def calculate_win_rate(trades: List[Trade]) -> Dict[str, float]:
        """Calculate win rate and related statistics."""
        closed_trades = [t for t in trades if t.status == TradeStatus.CLOSED and t.pnl is not None]
        
        if not closed_trades:
            return {
                "win_rate": 0.0,
                "total_trades": 0,
                "winning_trades": 0,
                "losing_trades": 0,
                "avg_win": 0.0,
                "avg_loss": 0.0,
                "profit_factor": 0.0
            }
        
        winning_trades = [t for t in closed_trades if t.pnl > 0]
        losing_trades = [t for t in closed_trades if t.pnl < 0]
        
        win_rate = (len(winning_trades) / len(closed_trades)) * 100 if closed_trades else 0
        avg_win = np.mean([t.pnl for t in winning_trades]) if winning_trades else 0
        avg_loss = np.mean([abs(t.pnl) for t in losing_trades]) if losing_trades else 0
        
        total_wins = sum([t.pnl for t in winning_trades])
        total_losses = abs(sum([t.pnl for t in losing_trades]))
        profit_factor = total_wins / total_losses if total_losses > 0 else 0
        
        return {
            "win_rate": win_rate,
            "total_trades": len(closed_trades),
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "profit_factor": profit_factor
        }
    
    @staticmethod
    def calculate_open_risk(positions: List[Dict]) -> Dict[str, float]:
        """Calculate total open risk from current positions."""
        if not positions:
            return {
                "total_open_risk": 0.0,
                "total_positions": 0,
                "total_unrealized_pnl": 0.0
            }
        
        total_risk = 0.0
        total_unrealized_pnl = 0.0
        
        for pos in positions:
            # Calculate risk based on position size and potential loss
            size = pos.get('size', 0)
            entry_price = pos.get('entry_price', 0)
            mark_price = pos.get('mark_price', 0)
            
            # Risk is the potential loss if position goes against you
            if size and entry_price:
                position_value = abs(size * entry_price)
                total_risk += position_value
            
            # Add unrealized PnL
            unrealized_pnl = pos.get('unrealized_pnl', 0)
            total_unrealized_pnl += unrealized_pnl
        
        return {
            "total_open_risk": total_risk,
            "total_positions": len(positions),
            "total_unrealized_pnl": total_unrealized_pnl
        }
    
    @staticmethod
    def calculate_var(trades: List[Trade], confidence_level: float = 0.95) -> float:
        """Calculate Value at Risk (VaR) at given confidence level."""
        if not trades:
            return 0.0
        
        returns = [t.pnl or 0 for t in trades if t.status == TradeStatus.CLOSED and t.pnl is not None]
        
        if not returns:
            return 0.0
        
        var = np.percentile(returns, (1 - confidence_level) * 100)
        return abs(var)
    
    @staticmethod
    def calculate_expectancy(trades: List[Trade]) -> float:
        """Calculate trade expectancy (average expected profit per trade)."""
        closed_trades = [t for t in trades if t.status == TradeStatus.CLOSED and t.pnl is not None]
        
        if not closed_trades:
            return 0.0
        
        win_rate_stats = RiskMetrics.calculate_win_rate(trades)
        win_rate = win_rate_stats['win_rate'] / 100
        avg_win = win_rate_stats['avg_win']
        avg_loss = win_rate_stats['avg_loss']
        
        expectancy = (win_rate * avg_win) - ((1 - win_rate) * avg_loss)
        return expectancy
