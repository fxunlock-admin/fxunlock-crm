#!/bin/bash

# Start the trading journal frontend
cd "$(dirname "$0")"

echo "🎨 Starting Multi-Broker Trading Journal Frontend..."
echo "📍 Dashboard will run on: http://localhost:3002"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Frontend starting..."
echo ""

# Start the development server
PORT=3002 npm start
