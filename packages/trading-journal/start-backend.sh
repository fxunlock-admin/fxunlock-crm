#!/bin/bash

# Start the trading journal backend
cd "$(dirname "$0")"

echo "🚀 Starting Multi-Broker Trading Journal Backend..."
echo "📍 Backend will run on: http://localhost:8001"
echo "📚 API Documentation: http://localhost:8001/docs"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r ../../requirements.txt

echo ""
echo "✅ Backend starting..."
echo ""

# Start the server
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
