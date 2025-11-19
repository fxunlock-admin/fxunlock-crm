# Multi-Broker Trading Journal

A comprehensive trading journal that supports multiple brokers, trade analysis, and performance metrics.

## Features

- **Multi-Broker Support**: Connect and track trades from multiple brokers in one place
- **Portfolio Management**: Organize trades into portfolios for better tracking
- **Performance Metrics**: Track key performance indicators and generate reports
- **RESTful API**: Built with FastAPI for easy integration with other tools
- **Extensible**: Easy to add support for new brokers through the broker interface

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/trading-journal.git
   cd trading-journal
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   python -m trading_journal.database.init_db
   ```

## Configuration

Create a `.env` file in the project root with the following variables:

```
# Database
DATABASE_URL=sqlite:///trading_journal.db
# For PostgreSQL: postgresql://user:password@localhost:5432/trading_journal

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours

# Logging
LOG_LEVEL=INFO
```

## Running the Application

Start the development server:

```bash
uvicorn trading_journal.main:app --reload
```

The API will be available at `http://localhost:8000` and the interactive API documentation at `http://localhost:8000/docs`.

## Project Structure

```
trading_journal/
├── __init__.py           # Package initialization
├── main.py               # FastAPI application
├── models/               # Pydantic models
│   └── trade.py          # Trade related models
├── database/             # Database related code
│   ├── __init__.py       # Database setup and session management
│   └── models.py         # SQLAlchemy models
├── brokers/              # Broker integrations
│   ├── __init__.py
│   └── base.py           # Base broker interface
└── api/                  # API endpoints
    ├── __init__.py
    ├── trades.py         # Trade related endpoints
    ├── brokers.py        # Broker related endpoints
    └── portfolios.py     # Portfolio related endpoints
```

## Adding a New Broker

To add support for a new broker:

1. Create a new file in the `brokers` directory (e.g., `brokers/binance.py`)
2. Create a class that inherits from `BaseBroker`
3. Implement all required methods from the `BrokerInterface`
4. Add any broker-specific functionality

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
