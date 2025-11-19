#!/bin/bash

# Simple backend start without virtual environment
cd "$(dirname "$0")"

echo "🚀 Starting Multi-Broker Trading Journal Backend..."
echo "📍 Backend will run on: http://localhost:8001"
echo "📚 API Documentation: http://localhost:8001/docs"
echo ""
echo "⚠️  Note: You may need to install dependencies first:"
echo "   /usr/bin/python3 -m pip install --user fastapi uvicorn pandas numpy python-dotenv ccxt sqlalchemy python-dateutil pydantic"
echo ""
echo "✅ Starting server..."
echo ""

# Start the server using system Python
/usr/bin/python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
