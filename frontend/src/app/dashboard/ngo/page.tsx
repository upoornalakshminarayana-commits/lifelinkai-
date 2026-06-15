"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, Campaign } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { Activity, Shield, Users, Heart, Calendar, Plus, MapPin, CheckCircle } from 'lucide-react';

export default function NgoDashboard() {
  const router = useRouter();
  const { currentUser, campaigns, createCampaign, joinCampaign } = useApp();

  // Campaign Form States
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [targetUnits, setTargetUnits] = useState(100);
  const [showWizard, setShowWizard] = useState(false);

  // Auth check
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.role !== 'ngo') {
      router.push(`/dashboard/${currentUser.role}`);
      return;
    }
  }, [currentUser, router]);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !location) return;

    createCampaign({
      title,
      organizer: currentUser?.name || 'Hope Alliance NGO',
      date,
      location,
      targetUnits
    });

    // Reset Form
    setTitle('');
    setDate('');
    setLocation('');
    setTargetUnits(100);
    setShowWizard(false);
  };

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans">
      <Navigation />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header metrics */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900">NGO Campaign Headquarters</h1>
            <p className="text-xs text-slate-500 font-medium">Coordinate drives, enroll volunteers, and target critical regional blood pools.</p>
          </div>
          <button
            onClick={() => setShowWizard(!showWizard)}
            className="px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <Plus size={14} />
            <span>Create Drive Campaign</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Campaign Creation Wizard */}
          {showWizard && (
            <div className="lg:col-span-12 bg-white rounded-3xl border border-primary/20 shadow-xl p-6 space-y-6">
              <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
                <Heart size={16} className="text-primary animate-pulse" />
                <span>Publish Public Awareness Campaign Drive</span>
              </h3>

              <form onSubmit={handleCreateCampaign} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drive Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Red Cross Summer Drive"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Scheduled</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Meeting Point Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Town Hall Hall A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Target Units (Bags)</label>
                  <input
                    type="number"
                    min={10}
                    value={targetUnits}
                    onChange={(e) => setTargetUnits(parseInt(e.target.value) || 100)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-semibold text-navy-900 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-4 flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWizard(false)}
                    className="px-4 py-2.5 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-md"
                  >
                    Publish Drive
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Campaigns list */}
          <div className="lg:col-span-12 bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Calendar size={16} className="text-primary" />
              <span>Active and Upcoming Drives</span>
            </h3>

            {campaigns.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No scheduled drives logged.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map((camp) => {
                  const percent = Math.round((camp.collectedUnits / camp.targetUnits) * 100);

                  return (
                    <div key={camp.id} className="p-5 rounded-2xl bg-slate-50 border border-gray-50 flex flex-col justify-between space-y-4 hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${camp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 animate-pulse' : 'bg-amber-50 text-amber-700'}`}>
                            {camp.status}
                          </span>
                          <h4 className="text-sm font-bold text-navy-900 mt-1">{camp.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{camp.date}</span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="flex items-center space-x-1.5">
                          <MapPin size={12} className="text-primary" />
                          <span>Location: {camp.location}</span>
                        </p>
                        <p className="flex items-center space-x-1.5">
                          <Users size={12} className="text-navy-900" />
                          <span>Volunteers enrolled: <strong>{camp.volunteersCount}</strong></span>
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Target: {camp.targetUnits} units</span>
                          <span className="text-primary">{percent}% Collected</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-primary" 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-[10px] text-slate-400 font-bold">Organizer: {camp.organizer}</span>
                        <button
                          onClick={() => joinCampaign(camp.id)}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-navy-900 border border-gray-200 rounded-lg text-[10px] font-semibold transition-all flex items-center space-x-0.5"
                        >
                          <Plus size={10} />
                          <span>Add Volunteer</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
