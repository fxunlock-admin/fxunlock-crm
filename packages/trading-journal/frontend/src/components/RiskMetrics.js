import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const RiskMetrics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/risk-metrics`);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching risk metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="glass glass-hover rounded-xl p-6 neon-border">
        <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Detailed Risk Metrics</h3>
        <div className="h-32 flex items-center justify-center">
          <p className="text-slate-400">Loading risk metrics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const riskLevel = data.max_drawdown.max_drawdown_percent > 20 ? 'high' : 
                    data.max_drawdown.max_drawdown_percent > 10 ? 'medium' : 'low';

  return (
    <div className="glass glass-hover rounded-xl p-6 neon-border">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Detailed Risk Metrics</h3>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-xl ${
          riskLevel === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
          riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
          'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
        }`}>
          <Shield size={18} className="drop-shadow-[0_0_4px_currentColor]" />
          <span className="capitalize">{riskLevel} Risk</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Maximum Drawdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <TrendingDown size={18} />
            <span className="font-medium">Maximum Drawdown</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Percentage</span>
              <span className="font-semibold text-red-400">
                {data.max_drawdown.max_drawdown_percent.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Amount</span>
              <span className="font-semibold text-red-400">
                ${data.max_drawdown.max_drawdown.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Duration</span>
              <span className="font-semibold">
                {data.max_drawdown.duration_days} days
              </span>
            </div>
          </div>
        </div>

        {/* Value at Risk */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <AlertTriangle size={18} />
            <span className="font-medium">Value at Risk</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">VaR 95%</span>
              <span className="font-semibold text-orange-400">
                ${data.var_95.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">VaR 99%</span>
              <span className="font-semibold text-red-400">
                ${data.var_99.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Open Risk</span>
              <span className="font-semibold">
                ${data.open_risk.total_open_risk.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Shield size={18} />
            <span className="font-medium">Performance Quality</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Sharpe Ratio</span>
              <span className="font-semibold text-blue-400">
                {data.sharpe_ratio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Expectancy</span>
              <span className={`font-semibold ${data.expectancy >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${data.expectancy.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">Win Rate</span>
              <span className="font-semibold">
                {data.win_rate_stats.win_rate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Warning */}
      {riskLevel === 'high' && (
        <div className="mt-8 p-5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl backdrop-blur-xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" size={24} />
            <div>
              <p className="font-bold text-red-400 mb-2 text-lg">⚠️ High Risk Alert</p>
              <p className="text-sm text-slate-200 leading-relaxed">
                Your maximum drawdown exceeds 20%. Consider reducing position sizes or reviewing your risk management strategy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskMetrics;
