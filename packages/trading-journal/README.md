# 🚀 Multi-Broker Trading Journal

A futuristic, comprehensive trading journal system that aggregates all your live trading accounts across multiple brokers into a unified dashboard with advanced analytics.

## ✨ Features

### 🎯 Core Functionality
- **Multi-Broker Support**: MT4, MT5, cTrader, DXtrade, Binance, and more
- **Unified Dashboard**: Consolidated view of all trading accounts
- **Real-time Sync**: Live position tracking and balance updates
- **Cross-Broker Analytics**: Compare performance across different brokers

### 📊 Analytics & Metrics
- **PnL Tracking**: Real-time profit/loss across all accounts
- **Risk Metrics**: 
  - Maximum Drawdown
  - Value at Risk (VaR)
  - Sharpe Ratio
  - Expectancy
  - Open Risk Exposure
- **Performance Stats**:
  - Win Rate
  - Profit Factor
  - Average Win/Loss
  - Trade Distribution
- **Broker Comparison**: Side-by-side performance analysis

### 🎨 Modern UI
- Glassmorphism design
- Animated gradients and neon effects
- Real-time data visualization
- Responsive charts with Recharts
- Dark mode optimized

## 🛠️ Tech Stack

### Backend
- **FastAPI**: High-performance async API
- **Python 3.8+**: Core language
- **CCXT**: Crypto exchange integration
- **MetaTrader5**: MT5 native integration
- **Pandas & NumPy**: Data analysis
- **SQLAlchemy**: Database ORM

### Frontend
- **React 18**: UI framework
- **TailwindCSS**: Styling
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **Axios**: HTTP client

## 📦 Installation

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   cd packages/trading-journal
   pip install -r ../../requirements.txt
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your broker credentials
   ```

3. **Run the backend server**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

### Frontend Setup

1. **Install Node dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API endpoint** (optional):
   ```bash
   # Create .env file in frontend directory
   echo "REACT_APP_API_URL=http://localhost:8001" > .env
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The dashboard will be available at `http://localhost:3002`

## ⚙️ Configuration

### Broker Setup

#### Binance
```env
BINANCE_API_KEY=your_api_key
BINANCE_API_SECRET=your_api_secret
```

#### MetaTrader 5
```env
MT5_ACCOUNT=12345678
MT5_PASSWORD=your_password
MT5_SERVER=YourBroker-Server
```

#### MetaTrader 4
MT4 requires a REST API bridge. Set up the bridge and configure:
```env
MT4_API_URL=http://localhost:8080
MT4_ACCOUNT=12345678
MT4_PASSWORD=your_password
```

## 🔌 API Endpoints

### Dashboard Endpoints
- `GET /dashboard/consolidated` - Consolidated stats across all brokers
- `GET /dashboard/broker-comparison` - Compare broker performance
- `GET /dashboard/performance-timeline` - Historical performance data
- `GET /dashboard/symbol-performance` - Performance by trading symbol
- `GET /dashboard/risk-metrics` - Comprehensive risk analysis

### Broker Endpoints
- `GET /trades?broker={broker_id}` - Get trades from specific broker
- `GET /balance?broker={broker_id}` - Get account balance
- `GET /positions?broker={broker_id}` - Get open positions
- `GET /market/{symbol}?broker={broker_id}` - Get market data
- `GET /brokers` - List all configured brokers

## 📊 Dashboard Features

### Main Dashboard
- **4 Key Metrics Cards**: Total P&L, Balance, Open Positions, Max Drawdown
- **Performance Timeline**: Daily/Weekly/Monthly P&L charts
- **Broker Comparison**: Visual comparison of all brokers
- **Risk Metrics**: Detailed risk analysis with alerts

### Real-time Updates
- Auto-refresh every 30 seconds
- Manual refresh button
- Live connection status indicators

## 🎨 UI Customization

The dashboard uses a futuristic design with:
- Animated gradient backgrounds
- Glassmorphism effects
- Neon borders and glows
- Smooth transitions and hover effects
- Cyber grid patterns

Customize colors in `frontend/tailwind.config.js` and `frontend/src/index.css`

## 🔒 Security

- Never commit `.env` files
- Use environment variables for all credentials
- API keys should have read-only permissions when possible
- Enable IP whitelisting on broker APIs
- Use HTTPS in production

## 🚀 Production Deployment

### Backend
```bash
# Use Gunicorn with Uvicorn workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Frontend
```bash
# Build for production
npm run build

# Serve with nginx or any static file server
```

## 📝 Adding New Brokers

1. Create a new broker class in `app/brokers/`
2. Inherit from `BrokerBase`
3. Implement required methods
4. Add configuration to `.env`
5. Register in `app/main.py`

Example:
```python
from .base import BrokerBase

class NewBroker(BrokerBase):
    async def connect(self) -> bool:
        # Implementation
        pass
    
    # Implement other required methods
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check the API documentation at `http://localhost:8001/docs`

## 🎯 Roadmap

- [ ] Add more broker integrations (cTrader, DXtrade)
- [ ] Trade journaling with notes and screenshots
- [ ] Advanced backtesting capabilities
- [ ] Mobile app
- [ ] Trade alerts and notifications
- [ ] Social trading features
- [ ] AI-powered trade analysis
