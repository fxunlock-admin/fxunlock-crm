import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import PerformanceChart from './components/PerformanceChart';
import BrokerComparison from './components/BrokerComparison';
import RiskMetrics from './components/RiskMetrics';
import './index.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function App() {
  const [consolidatedData, setConsolidatedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/consolidated`);
      setConsolidatedData(response.data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="glass glass-hover rounded-xl p-6 neon-border relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold mt-2 glow-text">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm font-semibold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend === 'up' ? <TrendingUp size={16} className="mr-1 animate-pulse" /> : <TrendingDown size={16} className="mr-1 animate-pulse" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-2xl backdrop-blur-xl relative ${
            trend === 'up' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10' : 
            trend === 'down' ? 'bg-gradient-to-br from-red-500/20 to-rose-500/10' : 
            'bg-gradient-to-br from-blue-500/20 to-cyan-500/10'
          }`}>
            <Icon className={`${
              trend === 'up' ? 'text-green-400' : 
              trend === 'down' ? 'text-red-400' : 
              'text-blue-400'
            } drop-shadow-[0_0_8px_currentColor]`} size={28} />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !consolidatedData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="text-center relative z-10">
          <div className="glass rounded-2xl p-8">
            <RefreshCw className="animate-spin text-blue-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" size={48} />
            <p className="text-slate-300 text-lg">Initializing Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !consolidatedData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="text-center relative z-10">
          <div className="glass rounded-2xl p-8">
            <AlertTriangle className="text-red-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" size={48} />
            <p className="text-slate-300 mb-4">Error loading dashboard: {error}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = consolidatedData || {};
  const totalPnL = data.total_pnl || 0;
  const pnlTrend = totalPnL >= 0 ? 'up' : 'down';

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 cyber-grid opacity-10"></div>
      
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Multi-Broker Trading Dashboard
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                  <p className="text-slate-300 text-sm font-medium">
                    {data.broker_count || 0} brokers connected
                  </p>
                </div>
                <span className="text-slate-500">•</span>
                <p className="text-slate-400 text-sm">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-700 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 disabled:hover:scale-100"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total P&L"
            value={`$${totalPnL.toFixed(2)}`}
            change={`${data.win_rate?.toFixed(1) || 0}% Win Rate`}
            icon={DollarSign}
            trend={pnlTrend}
          />
          <StatCard
            title="Total Balance"
            value={`$${(data.total_balance || 0).toFixed(2)}`}
            icon={Activity}
            trend="neutral"
          />
          <StatCard
            title="Open Positions"
            value={data.open_positions || 0}
            change={`$${(data.unrealized_pnl || 0).toFixed(2)} Unrealized`}
            icon={BarChart3}
            trend={data.unrealized_pnl >= 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Max Drawdown"
            value={`${(data.max_drawdown_percent || 0).toFixed(2)}%`}
            change={`$${(data.max_drawdown || 0).toFixed(2)}`}
            icon={AlertTriangle}
            trend="down"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass glass-hover rounded-xl p-6 neon-border">
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Total Trades</span>
                <span className="font-bold text-lg text-blue-400">{data.total_trades || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Winning Trades</span>
                <span className="font-bold text-lg text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]">{data.winning_trades || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Losing Trades</span>
                <span className="font-bold text-lg text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.5)]">{data.losing_trades || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Profit Factor</span>
                <span className="font-bold text-lg text-purple-400">{(data.profit_factor || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass glass-hover rounded-xl p-6 neon-border">
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Risk Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Sharpe Ratio</span>
                <span className="font-bold text-lg text-cyan-400">{(data.sharpe_ratio || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Expectancy</span>
                <span className="font-bold text-lg text-emerald-400">${(data.expectancy || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">VaR (95%)</span>
                <span className="font-bold text-lg text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.5)]">${(data.var_95 || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Open Risk</span>
                <span className="font-bold text-lg text-orange-400">${(data.open_risk || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass glass-hover rounded-xl p-6 neon-border">
            <h3 className="text-lg font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Average Trade</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Avg Win</span>
                <span className="font-bold text-lg text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]">${(data.avg_win || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Avg Loss</span>
                <span className="font-bold text-lg text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.5)]">${(data.avg_loss || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Win Rate</span>
                <span className="font-bold text-lg text-blue-400">{(data.win_rate || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-slate-300 font-medium">Active Brokers</span>
                <span className="font-bold text-lg text-purple-400">{data.broker_count || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PerformanceChart />
          <BrokerComparison />
        </div>

        {/* Risk Metrics Detail */}
        <RiskMetrics />
      </main>
    </div>
  );
}

export default App;
