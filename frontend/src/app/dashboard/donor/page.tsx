"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, DonorProfile } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { Heart, Activity, Award, Clock, MapPin, Check, ToggleLeft, ToggleRight, Radio, ExternalLink } from 'lucide-react';

export default function DonorDashboard() {
  const router = useRouter();
  const { currentUser, emergencies, donors, calculateMatches } = useApp();
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [nearbyNeeds, setNearbyNeeds] = useState<Array<{ hospital: string; group: string; dist: number; urgency: string }>>([]);

  // Check auth
  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    if (currentUser.role !== 'donor') {
      router.push(`/dashboard/${currentUser.role}`);
      return;
    }
    setDonorProfile(currentUser as DonorProfile);
  }, [currentUser, router]);

  // Load matching nearby emergencies
  useEffect(() => {
    if (!donorProfile) return;
    
    // Find active emergencies that need this donor's blood
    const matchedNeeds = emergencies
      .filter(e => e.status !== 'Completed' && e.status !== 'Accepted')
      .map(e => {
        // Calculate geographical distance
        const R = 6371;
        const lat1 = donorProfile.coordinates.lat;
        const lon1 = donorProfile.coordinates.lng;
        const lat2 = e.coordinates.lat;
        const lon2 = e.coordinates.lng;
        
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return {
          hospital: e.hospitalName,
          group: e.bloodGroup,
          dist: distance,
          urgency: e.urgency
        };
      })
      .filter(item => item.dist <= 15) // within 15km
      .slice(0, 3);

    setNearbyNeeds(matchedNeeds);
  }, [donorProfile, emergencies]);

  const toggleAvailability = () => {
    if (!donorProfile) return;
    const nextStates = {
      'Available': 'Unavailable' as const,
      'Unavailable': 'Emergency Available' as const,
      'Emergency Available': 'Available' as const
    };
    
    const newAvail = nextStates[donorProfile.availability];
    const updated = { ...donorProfile, availability: newAvail };
    setDonorProfile(updated);
    
    // Update local storage and globally
    const localDonors = localStorage.getItem('lifelink_donors');
    if (localDonors) {
      const parsed = JSON.parse(localDonors) as DonorProfile[];
      const mod = parsed.map(d => d.id === donorProfile.id ? { ...d, availability: newAvail } : d);
      localStorage.setItem('lifelink_donors', JSON.stringify(mod));
    }
    localStorage.setItem('lifelink_user', JSON.stringify(updated));
  };

  if (!donorProfile) return null;

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans">
      <Navigation />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Profile Card Summary */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-36 h-36 bg-primary-light rounded-full blur-[60px] -z-10"></div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex flex-col items-center justify-center font-bold font-display shadow-md">
              <span className="text-xl leading-none">{donorProfile.bloodGroup}</span>
              <span className="text-[9px] uppercase tracking-wider mt-0.5">Group</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900">{donorProfile.name}</h1>
              <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5 mt-0.5">
                <MapPin size={12} className="text-primary" />
                <span>Base location: {donorProfile.location}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Availability status toggle */}
            <div className="flex-1 md:flex-initial flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-gray-100 space-x-4 min-w-[200px]">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Availability</p>
                <p className="text-xs font-bold text-navy-900 capitalize flex items-center space-x-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${donorProfile.availability === 'Unavailable' ? 'bg-red-500' : donorProfile.availability === 'Emergency Available' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span>{donorProfile.availability}</span>
                </p>
              </div>
              <button 
                onClick={toggleAvailability}
                className="text-primary hover:text-primary-hover focus:outline-none transition-colors"
                title="Click to toggle status"
              >
                {donorProfile.availability === 'Unavailable' ? (
                  <ToggleLeft size={32} className="text-slate-400" />
                ) : (
                  <ToggleRight size={32} className="text-primary" />
                )}
              </button>
            </div>

            {/* Impact score banner */}
            <div className="flex-1 md:flex-initial p-3 rounded-2xl bg-primary-light border border-primary/10 text-primary flex items-center space-x-3 min-w-[140px]">
              <Award size={20} className="fill-primary/10" />
              <div>
                <p className="text-[9px] font-bold text-primary/70 uppercase tracking-wider">Impact Score</p>
                <p className="text-sm font-extrabold">{donorProfile.impactScore} pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Health Profile Fields */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Activity size={16} className="text-primary" />
              <span>Medical Eligibility Credentials</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Age</span>
                <span className="text-sm font-bold text-navy-900 block mt-1">{donorProfile.age} Years</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Weight</span>
                <span className="text-sm font-bold text-navy-900 block mt-1">{donorProfile.weight} Kg</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Organ Donor</span>
                <span className="text-sm font-bold text-navy-900 block mt-1">{donorProfile.organDonor ? 'Consent Registered' : 'Not Registered'}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Eligible Cycle</span>
                <span className="text-sm font-bold text-emerald-600 block mt-1">Verified Active</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-50 flex items-start space-x-3">
              <Clock size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Last Donation Date</p>
                <p className="text-xs font-semibold text-navy-900 mt-0.5">{donorProfile.lastDonationDate}</p>
                <p className="text-[10px] text-slate-500 mt-1">Requires 90 days interval between donation cycles.</p>
              </div>
            </div>
          </div>

          {/* AI Matching Opportunities */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Radio size={16} className="text-primary animate-pulse" />
              <span>AI Opportunity Engine: Local SOS Alerts Match</span>
            </h3>

            {nearbyNeeds.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-gray-100 rounded-2xl space-y-2">
                <Heart size={28} className="text-gray-300 mx-auto" />
                <p className="text-xs font-bold">No Urgent Compatibility Fits Found</p>
                <p className="text-[10px]">We will notify you immediately via Twilio SMS when an SOS is broadcast within your radius.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyNeeds.map((need, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-gray-50 hover:border-primary/20 transition-all flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${need.urgency.includes('CRITICAL') ? 'bg-red-50 text-red-700 animate-pulse' : 'bg-amber-50 text-amber-700'}`}>
                          {need.urgency}
                        </span>
                        <span className="text-[10px] text-slate-500">{need.dist.toFixed(1)} km away</span>
                      </div>
                      <p className="text-xs font-bold text-navy-900">{need.hospital}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-center bg-primary-light text-primary font-bold text-xs px-2.5 py-1 rounded-lg">
                        {need.group}
                      </div>
                      <button className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-[10px] font-bold transition-all flex items-center space-x-1">
                        <span>Details</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donation History Tracker */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-premium p-6 space-y-6 lg:col-span-3">
            <h3 className="text-sm font-bold text-navy-900 border-b border-gray-50 pb-3 flex items-center space-x-2">
              <Award size={16} className="text-primary" />
              <span>Personal Donation History & Impact Metrics</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-gray-50 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Donations</span>
                <span className="text-3xl font-extrabold text-navy-900 block mt-1">{donorProfile.livesSaved}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Times blood drawn and accepted</span>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-gray-50 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Lives Directly Helped</span>
                <span className="text-3xl font-extrabold text-primary block mt-1">{donorProfile.livesSaved * 3}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Assumes 1 bag serves 3 trauma recipients</span>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-gray-50 text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Impact Standing</span>
                <span className="text-3xl font-extrabold text-navy-900 block mt-1">Level 2</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">Top 12% in District</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historical Log</h4>
              <div className="flex justify-between items-center text-xs p-3.5 bg-slate-50 rounded-xl border border-gray-50">
                <div>
                  <p className="font-bold text-navy-900">Hospital Donation Drive #4</p>
                  <p className="text-[10px] text-slate-500">Completed via Red Cross campaign</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-navy-900">{donorProfile.lastDonationDate}</p>
                  <span className="text-[9px] text-emerald-600 font-bold flex items-center justify-end space-x-0.5">
                    <Check size={10} />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
