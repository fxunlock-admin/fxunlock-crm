import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const PerformanceChart = () => {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/performance-timeline`, {
          params: { period }
        });
        
        const chartData = response.data.dates.map((date, index) => ({
          date: new Date(date).toLocaleDateString(),
          pnl: response.data.period_pnl[index],
          cumulative: response.data.cumulative_pnl[index]
        }));
        
        setData(chartData);
      } catch (err) {
        console.error('Error fetching performance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return (
    <div className="glass glass-hover rounded-xl p-6 neon-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Performance Timeline</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="glass border border-white/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-blue-400"
        >
          <option value="daily" className="bg-slate-800">Daily</option>
          <option value="weekly" className="bg-slate-800">Weekly</option>
          <option value="monthly" className="bg-slate-800">Monthly</option>
        </select>
      </div>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">Loading chart...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-slate-400">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
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
            <Line 
              type="monotone" 
              dataKey="cumulative" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Cumulative P&L"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="pnl" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Period P&L"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PerformanceChart;
