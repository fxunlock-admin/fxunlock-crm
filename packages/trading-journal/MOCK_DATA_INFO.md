# 🎭 Mock Data Information

## Overview
The trading journal is now running with **realistic dummy data** for testing and demonstration purposes.

## Mock Data Details

### **3 Brokers Configured**
1. **Binance** - Crypto exchange
2. **MT5** - MetaTrader 5
3. **MT4** - MetaTrader 4

### **Trades Per Broker**
- Each broker has **40-80 random trades**
- **Total: ~135 trades** across all brokers
- **80% closed trades**, 20% open positions
- **60% win rate** (realistic trading performance)

### **Trade Characteristics**
- **Symbols**: EURUSD, GBPUSD, USDJPY, BTCUSD, ETHUSD, XAUUSD, AAPL, TSLA, GOOGL
- **Time Range**: Last 90 days
- **Winning Trades**: 0.5% to 5% profit
- **Losing Trades**: 0.3% to 3% loss
- **Trade Duration**: 1 to 72 hours

### **Account Balances**
- Each broker: **$5,000 - $50,000**
- Realistic equity fluctuations
- Margin and free margin calculated

### **Open Positions**
- **3-8 open positions** per broker
- **~17 total open positions**
- Live P&L calculations
- Swap and commission included

## API Endpoints with Data

### View All Brokers
```bash
curl http://localhost:8001/brokers
```

### Dashboard Data
```bash
curl http://localhost:8001/dashboard/consolidated
```

### Broker Comparison
```bash
curl http://localhost:8001/dashboard/broker-comparison
```

### Performance Timeline
```bash
curl http://localhost:8001/dashboard/performance-timeline?period=daily
```

### Risk Metrics
```bash
curl http://localhost:8001/dashboard/risk-metrics
```

### Reset Mock Data
Generate new random trades:
```bash
curl -X POST http://localhost:8001/mock/reset
```

## Sample Data Statistics

Based on current mock data:
- **Total P&L**: ~$223,000
- **Total Trades**: 135
- **Win Rate**: ~64%
- **Profit Factor**: ~3.17
- **Sharpe Ratio**: ~6.74
- **Max Drawdown**: ~8%

## Switching to Real Data

To use real broker connections instead of mock data:

1. Edit `.env` file:
   ```env
   USE_MOCK_DATA=false
   BINANCE_API_KEY=your_real_key
   BINANCE_API_SECRET=your_real_secret
   ```

2. Restart the backend

## Frontend Dashboard

Once the frontend is running on **http://localhost:3002**, you'll see:
- ✅ 3 brokers connected
- ✅ Real-time metrics with mock data
- ✅ Performance charts
- ✅ Risk analysis
- ✅ Broker comparisons

All visualizations will display the mock trading data in a beautiful futuristic UI!
