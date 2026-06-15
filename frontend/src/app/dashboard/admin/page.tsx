"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { Activity, Shield, Users, Heart, AlertCircle, RefreshCw, BarChart2, Award } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const { currentUser, donors, emergencies, campaigns } = useApp();

  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Auth check
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.role !== 'admin') {
      router.push(`/dashboard/${currentUser.role}`);
      return;
    }
  }, [currentUser, router]);

  // Set charts & logs
  useEffect(() => {
    // Donation trends over 5 months
    setTrendsData([
      { month: 'Jan', emergency: 12, completed: 34 },
      { month: 'Feb', emergency: 18, completed: 42 },
      { month: 'Mar', emergency: 15, completed: 51 },
      { month: 'Apr', emergency: 29, completed: 63 },
      { month: 'May', emergency: 32, completed: 78 }
    ]);

    // Blood distribution statistics based on registered donors list
    const counts: { [key: string]: number } = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 };
    donors.forEach(d => {
      if (counts[d.bloodGroup] !== undefined) counts[d.bloodGroup]++;
    });
    const dist = Object.entries(counts).map(([bg, val]) => ({ name: bg, count: val }));
    setDistributionData(dist);

    // Initial audit logs mock
    setAuditLogs([
      { id: 'a1', action: 'USER_LOGIN', desc: 'Admin authenticated from IP 192.168.1.104', timestamp: '2026-06-15T11:10:00Z', status: 'Success' },
      { id: 'a2', action: 'INVENTORY_AUDIT', desc: 'BloodBank restocked O- inventory by 4 Units', timestamp: '2026-06-15T10:45:00Z', status: 'Success' },
      { id: 'a3', action: 'SOS_BROADCAST_TRIGGER', desc: 'Emergency broadcast dispatched to O- donors nearby', timestamp: '2026-06-15T09:40:00Z', status: 'Success' },
      { id: 'a4', action: 'DB_BACKUP_SERVICE', desc: 'Weekly PostgreSQL logical backup verified in AWS S3', timestamp: '2026-06-15T08:00:00Z', status: 'Success' }
    ]);
  }, [donors]);

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans">
      <Navigation />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">National Health Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium">Platform control center, system telemetry audits, and regional demands.</p>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 bg-primary-light text-primary rounded-full border border-primary/10 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            <span>SYSTEM HEALTH: EXCELLENT</span>
          </span>
        </div>

        {/* Core Admin Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Registered Donors</span>
            <span className="text-2xl font-extrabold text-navy-900 block mt-1">{donors.length} Donors</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Emergency SOS calls</span>
            <span className="text-2xl font-extrabold text-red-600 block mt-1">
              {emergencies.filter(e => e.status !== 'Completed').length} Active
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed Drives</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">
              {campaigns.filter(c => c.status === 'Completed' || c.status === 'Active').length} Drives
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">SMS Twilio Dispatches</span>
            <span className="text-2xl font-extrabold text-navy-900 block mt-1">428 Alerts</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Donation Trends */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Activity size={16} className="text-primary animate-pulse" />
              <span>National Donation and Emergency Trends</span>
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" name="Completed Donations" />
                  <Area type="monotone" dataKey="emergency" stroke="#D32F2F" strokeWidth={2} strokeDasharray="4 4" fill="none" name="SOS Alerts Triggered" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Blood group distribution bar chart */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <BarChart2 size={16} className="text-primary" />
              <span>National Blood Group Distribution (Registered Donors)</span>
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#D32F2F" radius={[6, 6, 0, 0]} name="Active Profiles" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit Logs Ledger */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-4">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-primary" />
                <span>Security Audit Log Trail</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">HIPAA COMPLIANT LEDGER</span>
            </h3>

            <div className="space-y-3 font-mono text-[10px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between gap-2 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-primary">[{log.action}]</span>
                      <span className="text-slate-400">{log.desc}</span>
                    </div>
                  </div>
                  <div className="text-right flex sm:flex-col justify-between items-center sm:items-end text-[9px] text-slate-500">
                    <span className="text-emerald-400 font-bold">{log.status}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
