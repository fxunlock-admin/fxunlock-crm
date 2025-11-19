from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict
from datetime import datetime
import os
from dotenv import load_dotenv

from .models.trade import Trade, TradeStatus, TradeType
from .brokers.binance import BinanceBroker
from .brokers.mock import MockBroker
from .analytics.cross_broker import CrossBrokerAnalytics
from .analytics.risk_metrics import RiskMetrics
from .mock_data import get_mock_data, reset_mock_data

# Optional MT4/MT5 imports (not available on Mac)
try:
    from .brokers.mt5 import MT5Broker
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False
    print("⚠️  MT5 broker not available (Windows only)")

try:
    from .brokers.mt4 import MT4Broker
    MT4_AVAILABLE = True
except ImportError:
    MT4_AVAILABLE = False
    print("⚠️  MT4 broker not available")

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Multi-Broker Trading Journal",
    description="API for tracking and analyzing trades across multiple brokers",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize broker connections
brokers = {}

# Initialize analytics engines
analytics = CrossBrokerAnalytics()
risk_metrics = RiskMetrics()

# Check if we should use mock data (default to True if no real brokers configured)
use_mock_data = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'

if use_mock_data:
    # Initialize mock brokers with dummy data
    print("🎭 Using mock data for testing...")
    mock_data = get_mock_data()
    
    for broker_id in ['binance', 'mt5', 'mt4']:
        brokers[broker_id] = MockBroker(
            broker_id=broker_id,
            trades=mock_data['trades'][broker_id],
            balance=mock_data['balances'][broker_id],
            positions=mock_data['positions'][broker_id]
        )
    print(f"✅ Initialized {len(brokers)} mock brokers with dummy data")
else:
    # Initialize real brokers
    # Initialize Binance broker if API keys are available
    binance_api_key = os.getenv('BINANCE_API_KEY')
    binance_api_secret = os.getenv('BINANCE_API_SECRET')
    if binance_api_key and binance_api_secret:
        brokers['binance'] = BinanceBroker(binance_api_key, binance_api_secret)

    # Initialize MT5 broker if credentials are available and MT5 is available
    if MT5_AVAILABLE:
        mt5_account = os.getenv('MT5_ACCOUNT')
        mt5_password = os.getenv('MT5_PASSWORD')
        mt5_server = os.getenv('MT5_SERVER')
        if mt5_account and mt5_password and mt5_server:
            brokers['mt5'] = MT5Broker(int(mt5_account), mt5_password, mt5_server)

    # Initialize MT4 broker if credentials are available and MT4 is available
    if MT4_AVAILABLE:
        mt4_api_url = os.getenv('MT4_API_URL')
        mt4_account = os.getenv('MT4_ACCOUNT')
        mt4_password = os.getenv('MT4_PASSWORD')
        if mt4_api_url and mt4_account and mt4_password:
            brokers['mt4'] = MT4Broker(mt4_api_url, int(mt4_account), mt4_password)

@app.on_event("startup")
async def startup_event():
    """Initialize broker connections on startup."""
    for broker in brokers.values():
        await broker.connect()

@app.on_event("shutdown")
async def shutdown_event():
    """Close broker connections on shutdown."""
    for broker in brokers.values():
        await broker.disconnect()

@app.get("/trades", response_model=List[Trade])
async def get_trades(
    broker: str,
    symbol: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    status: Optional[TradeStatus] = None
):
    """Get trades from a specific broker."""
    if broker not in brokers:
        raise HTTPException(status_code=404, detail=f"Broker '{broker}' not found or not configured")
    
    try:
        return await brokers[broker].get_trades(
            symbol=symbol,
            start_time=start_time,
            end_time=end_time,
            status=status
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/balance")
async def get_balance(broker: str):
    """Get account balance from a specific broker."""
    if broker not in brokers:
        raise HTTPException(status_code=404, detail=f"Broker '{broker}' not found or not configured")
    
    try:
        return await brokers[broker].get_balance()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/positions")
async def get_positions(broker: str):
    """Get open positions from a specific broker."""
    if broker not in brokers:
        raise HTTPException(status_code=404, detail=f"Broker '{broker}' not found or not configured")
    
    try:
        return await brokers[broker].get_positions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market/{symbol}")
async def get_market_data(broker: str, symbol: str):
    """Get market data for a symbol from a specific broker."""
    if broker not in brokers:
        raise HTTPException(status_code=404, detail=f"Broker '{broker}' not found or not configured")
    
    try:
        return await brokers[broker].get_market_data(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============= DASHBOARD ENDPOINTS =============

@app.get("/dashboard/consolidated")
async def get_consolidated_dashboard(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
):
    """
    Get consolidated dashboard with aggregated stats across all brokers.
    Returns: Total PnL, risk metrics, open positions, and performance stats.
    """
    try:
        # Fetch data from all brokers
        broker_trades: Dict[str, List[Trade]] = {}
        broker_positions: Dict[str, List[Dict]] = {}
        broker_balances: Dict[str, Dict] = {}
        
        for broker_id, broker in brokers.items():
            try:
                trades = await broker.get_trades(
                    start_time=start_time,
                    end_time=end_time
                )
                positions = await broker.get_positions()
                balance = await broker.get_balance()
                
                broker_trades[broker_id] = trades
                broker_positions[broker_id] = positions
                broker_balances[broker_id] = balance
            except Exception as e:
                print(f"Error fetching data from {broker_id}: {e}")
                continue
        
        # Calculate consolidated stats
        consolidated_stats = analytics.calculate_consolidated_stats(
            broker_trades,
            broker_positions,
            broker_balances
        )
        
        # Add broker list
        consolidated_stats['active_brokers'] = list(brokers.keys())
        consolidated_stats['broker_count'] = len(brokers)
        
        return consolidated_stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/broker-comparison")
async def get_broker_comparison(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
):
    """
    Compare performance metrics across all brokers.
    Returns: Per-broker stats including PnL, win rate, Sharpe ratio, etc.
    """
    try:
        broker_trades: Dict[str, List[Trade]] = {}
        broker_balances: Dict[str, Dict] = {}
        
        for broker_id, broker in brokers.items():
            try:
                trades = await broker.get_trades(
                    start_time=start_time,
                    end_time=end_time
                )
                balance = await broker.get_balance()
                
                broker_trades[broker_id] = trades
                broker_balances[broker_id] = balance
            except Exception as e:
                print(f"Error fetching data from {broker_id}: {e}")
                continue
        
        comparison = analytics.compare_broker_performance(
            broker_trades,
            broker_balances
        )
        
        return {
            "brokers": comparison,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/performance-timeline")
async def get_performance_timeline(
    period: str = "daily",
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
):
    """
    Get performance timeline aggregated by period (daily, weekly, monthly).
    Returns: Time series of PnL across all brokers.
    """
    try:
        broker_trades: Dict[str, List[Trade]] = {}
        
        for broker_id, broker in brokers.items():
            try:
                trades = await broker.get_trades(
                    start_time=start_time,
                    end_time=end_time
                )
                broker_trades[broker_id] = trades
            except Exception as e:
                print(f"Error fetching data from {broker_id}: {e}")
                continue
        
        timeline = analytics.get_performance_timeline(broker_trades, period)
        
        return timeline
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/symbol-performance")
async def get_symbol_performance(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
):
    """
    Analyze performance by trading symbol across all brokers.
    Returns: Per-symbol stats including PnL, win rate, trade count.
    """
    try:
        broker_trades: Dict[str, List[Trade]] = {}
        
        for broker_id, broker in brokers.items():
            try:
                trades = await broker.get_trades(
                    start_time=start_time,
                    end_time=end_time
                )
                broker_trades[broker_id] = trades
            except Exception as e:
                print(f"Error fetching data from {broker_id}: {e}")
                continue
        
        symbol_stats = analytics.get_symbol_performance(broker_trades)
        
        return {
            "symbols": symbol_stats,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/risk-metrics")
async def get_risk_metrics(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
):
    """
    Get comprehensive risk metrics across all brokers.
    Returns: Max drawdown, VaR, Sharpe ratio, expectancy, etc.
    """
    try:
        broker_trades: Dict[str, List[Trade]] = {}
        broker_positions: Dict[str, List[Dict]] = {}
        
        for broker_id, broker in brokers.items():
            try:
                trades = await broker.get_trades(
                    start_time=start_time,
                    end_time=end_time
                )
                positions = await broker.get_positions()
                
                broker_trades[broker_id] = trades
                broker_positions[broker_id] = positions
            except Exception as e:
                print(f"Error fetching data from {broker_id}: {e}")
                continue
        
        # Aggregate all trades
        all_trades = analytics.aggregate_trades(broker_trades)
        all_positions = []
        for positions in broker_positions.values():
            all_positions.extend(positions)
        
        # Calculate risk metrics
        max_dd = risk_metrics.calculate_max_drawdown(all_trades)
        win_rate_stats = risk_metrics.calculate_win_rate(all_trades)
        sharpe = risk_metrics.calculate_sharpe_ratio(all_trades)
        expectancy = risk_metrics.calculate_expectancy(all_trades)
        var_95 = risk_metrics.calculate_var(all_trades, 0.95)
        var_99 = risk_metrics.calculate_var(all_trades, 0.99)
        open_risk = risk_metrics.calculate_open_risk(all_positions)
        
        return {
            "max_drawdown": max_dd,
            "win_rate_stats": win_rate_stats,
            "sharpe_ratio": sharpe,
            "expectancy": expectancy,
            "var_95": var_95,
            "var_99": var_99,
            "open_risk": open_risk,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/brokers")
async def list_brokers():
    """List all configured brokers and their connection status."""
    broker_info = []
    
    for broker_id, broker in brokers.items():
        broker_info.append({
            'broker_id': broker_id,
            'connected': True,  # Assume connected if in dict
            'type': broker.__class__.__name__
        })
    
    return {'brokers': broker_info}

@app.post("/mock/reset")
async def reset_mock():
    """Reset mock data with new random trades (only works if USE_MOCK_DATA=true)"""
    if not use_mock_data:
        raise HTTPException(status_code=400, detail="Mock data is not enabled. Set USE_MOCK_DATA=true")
    
    try:
        # Generate new mock data
        new_mock_data = reset_mock_data()
        
        # Update brokers with new data
        for broker_id in ['binance', 'mt5', 'mt4']:
            brokers[broker_id] = MockBroker(
                broker_id=broker_id,
                trades=new_mock_data['trades'][broker_id],
                balance=new_mock_data['balances'][broker_id],
                positions=new_mock_data['positions'][broker_id]
            )
            await brokers[broker_id].connect()
        
        return {
            'status': 'success',
            'message': 'Mock data has been reset with new random trades',
            'brokers': list(brokers.keys())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
