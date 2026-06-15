"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, EmergencyRequest } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { Activity, Shield, MapPin, Send, AlertTriangle, RefreshCw, Radio, CheckCircle, Smartphone } from 'lucide-react';

export default function RecipientDashboard() {
  const router = useRouter();
  const { currentUser, createEmergency, emergencies, smsLogs, calculateMatches } = useApp();
  
  // Form States
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [units, setUnits] = useState(2);
  const [hospital, setHospital] = useState('Metro General Hospital');
  const [location, setLocation] = useState('Metro Plaza East Sector');
  const [urgency, setUrgency] = useState<'Routine' | 'Urgent' | 'CRITICAL (SOS)'>('CRITICAL (SOS)');
  
  // Tracking states
  const [activeRequest, setActiveRequest] = useState<EmergencyRequest | null>(null);
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [smsFeed, setSmsFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Auth check
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.role !== 'recipient') {
      router.push(`/dashboard/${currentUser.role}`);
      return;
    }
  }, [currentUser, router]);

  // Sync current active request or history
  useEffect(() => {
    const active = emergencies.find(e => e.status === 'Matching' || e.status === 'Notified' || e.status === 'Pending');
    if (active) {
      setActiveRequest(active);
      loadMatches(active);
    } else {
      setActiveRequest(null);
      setMatchingResults([]);
    }
  }, [emergencies]);

  // Load relevant SMS alerts triggered
  useEffect(() => {
    if (activeRequest) {
      const filteredSms = smsLogs.slice(0, 3);
      setSmsFeed(filteredSms);
    } else {
      setSmsFeed([]);
    }
  }, [smsLogs, activeRequest]);

  const loadMatches = (req: EmergencyRequest) => {
    // Generate AI matching list
    const results = calculateMatches(req.bloodGroup, req.coordinates, req.urgency);
    setMatchingResults(results);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const reqCoords = {
      lat: 40.7128 + (Math.random() - 0.5) * 0.05,
      lng: -74.0060 + (Math.random() - 0.5) * 0.05
    };

    // Trigger state context creation
    const newRequest = createEmergency({
      hospitalName: hospital,
      patientName: currentUser?.name || 'Emergency Patient',
      bloodGroup,
      unitsRequired: units,
      urgency,
      location,
      coordinates: reqCoords
    });

    setTimeout(() => {
      setActiveRequest(newRequest);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans">
      <Navigation />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">Emergency Recipient Network</h1>
            <p className="text-xs text-slate-500 font-medium">Broadcast requests and calculate compatibility matches instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Request Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Activity size={16} className="text-primary animate-pulse" />
              <span>Create Emergency Donor Call</span>
            </h3>

            {activeRequest ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-50 space-y-4">
                <div className="flex items-center space-x-2 text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl">
                  <CheckCircle size={16} />
                  <span>Request Active & Broadcasting</span>
                </div>

                <div className="space-y-2 text-xs text-navy-800">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-slate-500 font-medium">Blood Group Needed:</span>
                    <span className="font-extrabold text-primary">{activeRequest.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-slate-500 font-medium">Quantity (Units):</span>
                    <span className="font-bold">{activeRequest.unitsRequired} Units</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-slate-500 font-medium">Hospital:</span>
                    <span className="font-bold">{activeRequest.hospitalName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-slate-500 font-medium">Urgency Profile:</span>
                    <span className={`font-bold uppercase ${activeRequest.urgency.includes('CRITICAL') ? 'text-red-600' : 'text-amber-600'}`}>
                      {activeRequest.urgency}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[9px] text-slate-500 italic">
                    To trigger a new requirement, please coordinate with clinical verification staff once this emergency request resolves.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-semibold text-navy-900 focus:outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required Quantity (Bags)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={units}
                      onChange={(e) => setUnits(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-semibold text-navy-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Admitted Hospital Name</label>
                  <input
                    type="text"
                    placeholder="e.g. City Sacred Trauma Center"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hospital Address / Location Details</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Emergency Ward, Ground Floor Room 12"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-semibold text-navy-900 focus:outline-none"
                  >
                    <option value="Routine">Routine (Surgery Reserve)</option>
                    <option value="Urgent">Urgent (Needed within 12 Hours)</option>
                    <option value="CRITICAL (SOS)">CRITICAL (SOS Broadcast: Instant SMS)</option>
                  </select>
                </div>

                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-[10px] flex items-start space-x-2">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    WARNING: SOS broadcasts trigger real-time Twilio SMS pings to nearby registered matches. Please submit only for verified medical emergencies.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Broadcasting Requirement...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Trigger AI Donor Search</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* AI Search & Matching Map Tracker */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* AI Ranking results */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
              <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Radio size={16} className={`text-primary ${activeRequest ? 'animate-pulse' : ''}`} />
                  <span>AI Matching Analysis Engine</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">GEOLOCATION COMPATIBILITY</span>
              </h3>

              {!activeRequest ? (
                <div className="p-12 text-center text-slate-500 border border-dashed border-gray-100 rounded-2xl space-y-2">
                  <Radio size={32} className="text-gray-300 mx-auto" />
                  <p className="text-xs font-bold">Waiting for Active Request Broadcast</p>
                  <p className="text-[10px]">Create an emergency call on the left panel to trigger the matching matrix calculation.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchingResults.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 rounded-2xl flex flex-col items-center">
                      <RefreshCw size={24} className="animate-spin text-primary mb-2" />
                      <p className="text-xs font-bold">Computing Compatibility Vectors...</p>
                      <p className="text-[10px] mt-1">Cross-referencing blood matrices, geographic distances, and eligibility criteria.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ranked Candidate Matches</p>
                      {matchingResults.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-navy-900">{item.donor.name}</span>
                              <span className="text-[10px] font-semibold text-slate-500">({item.distance.toFixed(1)} km)</span>
                            </div>
                            <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                              <MapPin size={10} className="text-primary" />
                              <span>{item.donor.location}</span>
                            </p>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Match score</span>
                              <span className="text-xs font-extrabold text-emerald-600 block">{Math.round(item.score)}% Compatibility</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                              {item.donor.bloodGroup}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Twilio SMS Notification Stream */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-4">
              <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
                <Smartphone size={16} className="text-primary" />
                <span>Twilio SMS Broadcast Console (Simulated Feed)</span>
              </h3>

              {!activeRequest || smsFeed.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic p-2">No active broadcasts. SMS logs generate once search matches are computed.</p>
              ) : (
                <div className="space-y-3">
                  {smsFeed.map((log, index) => (
                    <div key={index} className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] border border-white/5 space-y-1.5 shadow-md">
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold border-b border-white/10 pb-1">
                        <span>Recipient: {log.recipientPhone}</span>
                        <span className="text-emerald-400">DISPATCHED</span>
                      </div>
                      <p className="leading-relaxed text-slate-200">{log.message}</p>
                      <div className="text-right text-[8px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
