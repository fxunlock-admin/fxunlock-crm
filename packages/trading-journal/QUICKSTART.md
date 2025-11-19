# 🚀 Quick Start Guide

## Start the Trading Journal in 2 Steps

### Step 1: Start Backend (Terminal 1)
```bash
cd /Users/dominicmustafa/CascadeProjects/windsurf-project/packages/trading-journal
./start-backend.sh
```

Wait until you see: `Uvicorn running on http://0.0.0.0:8001`

### Step 2: Start Frontend (Terminal 2)
```bash
cd /Users/dominicmustafa/CascadeProjects/windsurf-project/packages/trading-journal/frontend
./start-frontend.sh
```

### Access the Dashboard
Open your browser to: **http://localhost:3002**

---

## Troubleshooting

### Backend won't start?
1. Make sure Python 3 is installed: `python3 --version`
2. Check if port 8001 is free: `lsof -i :8001`
3. View backend logs in the terminal

### Frontend won't start?
1. Make sure Node.js is installed: `node --version`
2. Check if port 3002 is free: `lsof -i :3002`
3. Try: `cd frontend && npm install && PORT=3002 npm start`

### "Site can't be reached"?
1. **Backend must be running first** - Check Terminal 1
2. Wait 10-20 seconds for the frontend to compile
3. Check the terminal for any error messages
4. Try accessing the backend directly: http://localhost:8001/docs

### Configure Brokers
1. Copy `.env.example` to `.env`
2. Add your broker API credentials
3. Restart the backend

---

## Manual Start (Alternative)

### Backend
```bash
cd packages/trading-journal
python3 -m venv venv
source venv/bin/activate
pip install -r ../../requirements.txt
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd packages/trading-journal/frontend
npm install
PORT=3002 npm start
```
