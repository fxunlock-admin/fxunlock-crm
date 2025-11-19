from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List, Optional
import uvicorn

from .database import get_db
from .models.trade import Trade, TradeUpdate, TradeType, TradeStatus
from .database.models import Broker as DBBroker, Portfolio as DBPortfolio, Session

app = FastAPI(
    title="Multi-Broker Trading Journal API",
    description="API for tracking and analyzing trades across multiple brokers",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Trading Journal API is running"}

# Trade endpoints
@app.post("/trades/", response_model=Trade, status_code=status.HTTP_201_CREATED)
async def create_trade(trade: Trade, db: Session = Depends(get_db)):
    """Create a new trade."""
    db_trade = DBTrade(**trade.dict())
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    return db_trade

@app.get("/trades/", response_model=List[Trade])
async def list_trades(
    skip: int = 0, 
    limit: int = 100, 
    symbol: Optional[str] = None,
    trade_type: Optional[TradeType] = None,
    status: Optional[TradeStatus] = None,
    db: Session = Depends(get_db)
):
    """List all trades with optional filtering."""
    query = db.query(DBTrade)
    
    if symbol:
        query = query.filter(DBTrade.symbol == symbol)
    if trade_type:
        query = query.filter(DBTrade.trade_type == trade_type)
    if status:
        query = query.filter(DBTrade.status == status)
        
    return query.offset(skip).limit(limit).all()

@app.get("/trades/{trade_id}", response_model=Trade)
async def get_trade(trade_id: str, db: Session = Depends(get_db)):
    """Get a specific trade by ID."""
    db_trade = db.query(DBTrade).filter(DBTrade.id == trade_id).first()
    if not db_trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return db_trade

@app.patch("/trades/{trade_id}", response_model=Trade)
async def update_trade(
    trade_id: str, 
    trade_update: TradeUpdate, 
    db: Session = Depends(get_db)
):
    """Update a trade's notes or metadata."""
    db_trade = db.query(DBTrade).filter(DBTrade.id == trade_id).first()
    if not db_trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    update_data = trade_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_trade, field, value)
    
    db.commit()
    db.refresh(db_trade)
    return db_trade

# Broker endpoints
@app.get("/brokers/", response_model=List[dict])
async def list_brokers(db: Session = Depends(get_db)):
    """List all configured brokers."""
    return db.query(DBBroker).all()

# Portfolio endpoints
@app.get("/portfolios/", response_model=List[dict])
async def list_portfolios(db: Session = Depends(get_db)):
    """List all portfolios."""
    return db.query(DBPortfolio).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
