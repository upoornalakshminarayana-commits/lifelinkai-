"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { Activity, Shield, AlertCircle, Plus, Minus, TrendingUp, RefreshCw, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';

export default function BloodBankDashboard() {
  const router = useRouter();
  const { currentUser, inventory, updateInventory } = useApp();

  const [selectedGroup, setSelectedGroup] = useState('O-');
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [chartData, setChartData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);

  // Auth check
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.role !== 'bloodbank') {
      router.push(`/dashboard/${currentUser.role}`);
      return;
    }
  }, [currentUser, router]);

  // Set up chart formatting
  useEffect(() => {
    const data = Object.entries(inventory).map(([group, details]) => ({
      name: group,
      units: details.units,
      min: details.minThreshold,
      alerts: details.expiryAlerts
    }));
    setChartData(data);

    // Simple simulated forecast line chart data (e.g. demand trend over 6 months)
    setForecastData([
      { month: 'Jan', actual: 45, forecast: 48 },
      { month: 'Feb', actual: 52, forecast: 50 },
      { month: 'Mar', actual: 58, forecast: 62 },
      { month: 'Apr', actual: 63, forecast: 65 },
      { month: 'May', actual: 72, forecast: 70 },
      { month: 'Jun', forecast: 85 } // future forecast
    ]);
  }, [inventory]);

  const handleAdjust = (type: 'add' | 'remove') => {
    const current = inventory[selectedGroup]?.units || 0;
    const nextAmount = type === 'add' ? current + adjustAmount : current - adjustAmount;
    updateInventory(selectedGroup, nextAmount);
  };

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans">
      <Navigation />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header metrics */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">Regional Blood Bank Center</h1>
            <p className="text-xs text-slate-500 font-medium">Coordinate stockpiles, monitor storage metrics, and audit regional distributions.</p>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Temperature monitors active: 4.1 °C</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Inventory Meters Gauges */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Activity size={16} className="text-primary animate-pulse" />
              <span>Real-Time Stockpile Meter Matrix</span>
            </h3>

            {chartData.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Loading metrics...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {chartData.map((item) => {
                  const percent = Math.min(100, (item.units / item.min) * 100);
                  const isLow = item.units < item.min;

                  return (
                    <div key={item.name} className="p-4 rounded-2xl bg-slate-50 border border-gray-50 flex flex-col justify-between space-y-3 relative overflow-hidden">
                      {isLow && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="w-8 h-8 rounded-lg bg-primary-light text-primary font-bold text-xs flex items-center justify-center">
                          {item.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLow ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isLow ? 'CRITICAL' : 'STABLE'}
                        </span>
                      </div>

                      <div>
                        <span className="text-2xl font-extrabold text-navy-900">{item.units}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">Target: {item.min} Units</span>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${isLow ? 'bg-primary' : 'bg-emerald-500'}`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Adjustment Panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Plus size={16} className="text-primary" />
              <span>Modify Inventory Levels</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Blood Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-semibold text-navy-900 focus:outline-none"
                >
                  {Object.keys(inventory).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adjustment Quantity (Bags)</label>
                <input
                  type="number"
                  min={1}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-semibold text-navy-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleAdjust('add')}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all"
                >
                  <Plus size={14} />
                  <span>Restock</span>
                </button>
                <button
                  onClick={() => handleAdjust('remove')}
                  className="py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all"
                >
                  <Minus size={14} />
                  <span>Deduct</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expiry Alerts & Forecast Charts */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <AlertCircle size={16} className="text-primary animate-pulse" />
              <span>Expiry Alerts Ledger (Next 7 Days)</span>
            </h3>

            <div className="space-y-3">
              {chartData.filter(i => i.alerts > 0).map((item) => (
                <div key={item.name} className="p-3.5 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center text-xs text-red-700">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={14} />
                    <span><strong>{item.alerts} Units</strong> of <strong>{item.name}</strong> nearing expiration.</span>
                  </div>
                  <button className="text-[10px] font-bold hover:underline">Flag Audit</button>
                </div>
              ))}
              {chartData.filter(i => i.alerts > 0).length === 0 && (
                <p className="text-xs text-slate-500 italic">No batches nearing standard expiration thresholds.</p>
              )}
            </div>
          </div>

          {/* Demand Forecasting Recharts Area Chart */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-primary" />
                <span>AI Demand Forecast Matrix</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">REGIONAL PREDICTIVE MODEL</span>
            </h3>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#D32F2F" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A192F" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0A192F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="actual" stroke="#D32F2F" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Actual Units Dispatched" />
                  <Area type="monotone" dataKey="forecast" stroke="#0A192F" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorForecast)" name="Predicted Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
