#!/bin/bash

# FX Unlocked CRM - Quick Start Script
# This script helps you set up the CRM quickly

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║                                                      ║"
echo "║       FX Unlocked CRM - Quick Start Setup           ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found in PATH"
    echo "   Please ensure PostgreSQL is installed and running"
    echo "   Download from: https://www.postgresql.org/download/"
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ PostgreSQL detected"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your PostgreSQL credentials"
    echo "   File location: backend/.env"
    echo ""
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
    echo "✅ Frontend .env created"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Configure your database connection in backend/.env:"
echo "   DATABASE_URL=\"postgresql://username:password@localhost:5432/fxu_crm\""
echo ""
echo "2. Create the PostgreSQL database:"
echo "   psql -U postgres -c \"CREATE DATABASE fxu_crm;\""
echo ""
echo "3. Run database migrations:"
echo "   cd backend"
echo "   npx prisma migrate dev"
echo "   npm run prisma:seed"
echo ""
echo "4. Start the application:"
echo "   cd .."
echo "   npm run dev"
echo ""
echo "5. Open your browser:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8002"
echo ""
echo "6. Login with default credentials:"
echo "   Email:    admin@fxunlock.com"
echo "   Password: Admin123!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 For detailed instructions, see SETUP.md"
echo ""
