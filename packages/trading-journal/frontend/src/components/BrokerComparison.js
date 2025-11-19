import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const BrokerComparison = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/broker-comparison`);
        setData(response.data.brokers);
      } catch (err) {
        console.error('Error fetching broker comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="glass glass-hover rounded-xl p-6 neon-border">
      <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Broker Performance Comparison</h3>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">Loading comparison...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">No broker data available</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="broker_id" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="total_pnl" fill="#3b82f6" name="Total P&L" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-6 space-y-3">
            {data.map((broker) => (
              <div key={broker.broker_id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/10 hover:border-blue-400/30 group">
                <div>
                  <span className="font-bold capitalize text-lg text-slate-200 group-hover:text-blue-400 transition-colors">{broker.broker_id}</span>
                  <div className="text-slate-400 text-sm mt-1">
                    <span className="font-medium">{broker.total_trades}</span> trades • 
                    <span className="font-medium ml-1">{broker.win_rate.toFixed(1)}%</span> win rate
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-xl ${broker.total_pnl >= 0 ? 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}>
                    ${broker.total_pnl.toFixed(2)}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    Sharpe: <span className="text-cyan-400 font-semibold">{broker.sharpe_ratio.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BrokerComparison;
