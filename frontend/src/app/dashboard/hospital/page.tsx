"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, EmergencyRequest } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { Activity, Shield, MapPin, Check, Plus, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function HospitalDashboard() {
  const router = useRouter();
  const { currentUser, emergencies, donors, completeDonation, calculateMatches } = useApp();
  
  const [activeCases, setActiveCases] = useState<EmergencyRequest[]>([]);
  const [historyCases, setHistoryCases] = useState<EmergencyRequest[]>([]);
  const [matchingModalReq, setMatchingModalReq] = useState<EmergencyRequest | null>(null);
  const [modalMatches, setModalMatches] = useState<any[]>([]);

  // Auth check
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.role !== 'hospital') {
      router.push(`/dashboard/${currentUser.role}`);
      return;
    }
  }, [currentUser, router]);

  // Sync request statuses
  useEffect(() => {
    const active = emergencies.filter(e => e.status !== 'Completed');
    const completed = emergencies.filter(e => e.status === 'Completed');
    
    setActiveCases(active);
    setHistoryCases(completed);
  }, [emergencies]);

  const handleOpenMatches = (req: EmergencyRequest) => {
    setMatchingModalReq(req);
    const results = calculateMatches(req.bloodGroup, req.coordinates, req.urgency);
    setModalMatches(results);
  };

  const handleVerifyDonation = (emergencyId: string, donorId: string) => {
    completeDonation(emergencyId, donorId);
    if (matchingModalReq && matchingModalReq.id === emergencyId) {
      setMatchingModalReq(null);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans">
      <Navigation />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Authorized Hub</span>
            <span className="text-sm font-bold text-navy-900 block mt-1">{currentUser?.name || 'Metropolitan General'}</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active SOS Requests</span>
            <span className="text-2xl font-extrabold text-red-600 block mt-1">
              {activeCases.filter(e => e.urgency.includes('SOS')).length} Active
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pending Verifications</span>
            <span className="text-2xl font-extrabold text-amber-500 block mt-1">
              {activeCases.filter(e => e.status === 'Notified').length} Pending
            </span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-premium">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed Admissions</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{historyCases.length} Done</span>
          </div>
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Emergencies Tracker */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
              <h3 className="text-sm font-bold text-navy-900 flex items-center space-x-2">
                <Activity size={16} className="text-primary animate-pulse" />
                <span>Hospital Emergency Coordinator Panel</span>
              </h3>
            </div>

            {activeCases.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No active emergency requests in this region.</p>
            ) : (
              <div className="space-y-4">
                {activeCases.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-navy-900">{req.patientName}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${req.urgency.includes('SOS') ? 'bg-red-50 text-red-700 animate-pulse' : 'bg-amber-50 text-amber-700'}`}>
                          {req.urgency}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                        <MapPin size={10} className="text-primary" />
                        <span>{req.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-center bg-primary-light text-primary font-bold text-xs px-2.5 py-1 rounded-lg">
                        {req.bloodGroup}
                      </div>

                      {req.status === 'Notified' && req.assignedDonorId ? (
                        <button
                          onClick={() => handleVerifyDonation(req.id, req.assignedDonorId!)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-semibold transition-all flex items-center space-x-1"
                        >
                          <Check size={12} />
                          <span>Verify Donation</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenMatches(req)}
                          className="px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-[10px] font-semibold transition-all flex items-center space-x-1"
                        >
                          <Layers size={12} />
                          <span>Match Analysis ({req.matchScore ? `${req.matchScore}%` : 'Calculate'})</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal / Sidebar detail analysis of matches */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3">
              Live Match Discoverer Details
            </h3>

            {matchingModalReq ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-gray-100">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Analyzing Case</span>
                  <span className="text-xs font-bold text-navy-900">{matchingModalReq.patientName} - Needs {matchingModalReq.bloodGroup}</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top AI Recommendations</p>
                  {modalMatches.map((match, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-gray-50 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-navy-900">{match.donor.name}</span>
                        <span className="font-semibold text-emerald-600">{Math.round(match.score)}% fit</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Distance: {match.distance.toFixed(1)} km</span>
                        <span className="capitalize text-primary font-medium">{match.donor.availability}</span>
                      </div>
                      
                      {matchingModalReq.status !== 'Notified' && (
                        <button
                          onClick={() => handleVerifyDonation(matchingModalReq.id, match.donor.id)}
                          className="w-full mt-1.5 py-1.5 bg-primary text-white font-bold rounded-lg text-[9px] hover:bg-primary-hover transition-colors"
                        >
                          Assign and Verify Match
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-gray-100 rounded-2xl">
                <Shield size={24} className="mx-auto mb-2 opacity-50 text-navy-900" />
                <p className="text-xs font-bold">Select Request to Inspect</p>
                <p className="text-[10px] mt-1">Click "Match Analysis" on any emergency on the left to review geographical compatibilities.</p>
              </div>
            )}
          </div>

          {/* Historical Verifications */}
          <div className="lg:col-span-12 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-4">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3">
              Historical Verification Admissions
            </h3>

            {historyCases.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No completed admissions logged today.</p>
            ) : (
              <div className="space-y-2">
                {historyCases.map((h) => (
                  <div key={h.id} className="p-3.5 bg-slate-50 rounded-xl border border-gray-50 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-navy-900">{h.patientName} ({h.bloodGroup})</p>
                      <p className="text-[9px] text-slate-500">{h.hospitalName} - Completed</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-navy-900">{h.unitsRequired} Units</p>
                      <span className="text-[9px] text-emerald-600 font-bold">Clinical Audit Logged</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
