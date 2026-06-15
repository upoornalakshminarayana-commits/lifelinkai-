"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useApp } from '@/context/AppContext';
import { Heart, Shield, Radio, MapPin, Award, ArrowRight, Activity, Zap, Users, Building, HelpCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function LandingPage() {
  const { donors, emergencies } = useApp();
  const [radarScanning, setRadarScanning] = useState(false);
  const [radarMatches, setRadarMatches] = useState<Array<{ name: string; group: string; dist: string; active: boolean }>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Donor Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBlood, setFilterBlood] = useState('All');
  const [filterAvail, setFilterAvail] = useState('All');

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          donor.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = filterBlood === 'All' || donor.bloodGroup === filterBlood;
    const matchesAvail = filterAvail === 'All' || donor.availability === filterAvail;
    return matchesSearch && matchesBlood && matchesAvail;
  });

  // Radar Animation logic
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    const drawRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) - 10;

      // Draw outer rings
      ctx.strokeStyle = 'rgba(211, 47, 47, 0.15)';
      ctx.lineWidth = 1;
      for (let r = radius / 3; r <= radius; r += radius / 3) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.strokeStyle = 'rgba(211, 47, 47, 0.1)';
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Draw sweep line
      if (radarScanning) {
        ctx.strokeStyle = 'rgba(211, 47, 47, 0.5)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const targetX = cx + radius * Math.cos(angle);
        const targetY = cy + radius * Math.sin(angle);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Sweep fade gradient
        const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        sweepGrad.addColorStop(0, 'rgba(211, 47, 47, 0.05)');
        sweepGrad.addColorStop(1, 'rgba(211, 47, 47, 0)');
        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle - 0.25, angle);
        ctx.lineTo(cx, cy);
        ctx.fill();

        angle += 0.025;
      }

      // Plot static matches
      radarMatches.forEach((match, index) => {
        if (!match.active) return;
        const offsetAngle = (index * (Math.PI / 2.5)) + 0.4;
        const matchDist = (index + 1) * (radius / 4) + 15;
        const mx = cx + matchDist * Math.cos(offsetAngle);
        const my = cy + matchDist * Math.sin(offsetAngle);

        // Blinking dot
        ctx.fillStyle = '#D32F2F';
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fill();

        // Outer pulse circle
        ctx.strokeStyle = 'rgba(211, 47, 47, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Donor text label
        ctx.fillStyle = '#0A192F';
        ctx.font = 'bold 9px Inter';
        ctx.fillText(`${match.name} (${match.group})`, mx + 10, my - 2);
        ctx.fillStyle = '#64748B';
        ctx.font = '8px Inter';
        ctx.fillText(match.dist, mx + 10, my + 8);
      });

      animationId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [radarScanning, radarMatches]);

  const triggerRadarScan = () => {
    if (radarScanning) return;
    setRadarScanning(true);
    setRadarMatches([]);

    // Simulate donor discoveries along the timeline
    const discoveries = [
      { name: 'John Doe', group: 'O-', dist: '0.6 km away', active: false },
      { name: 'David Lee', group: 'O+', dist: '1.4 km away', active: false },
      { name: 'Jane Smith', group: 'A+', dist: '2.1 km away', active: false },
      { name: 'Elena Rostova', group: 'A-', dist: '3.8 km away', active: false },
    ];

    discoveries.forEach((disc, index) => {
      setTimeout(() => {
        setRadarMatches(prev => {
          const next = [...prev];
          next.push({ ...disc, active: true });
          return next;
        });
      }, (index + 1) * 1200);
    });

    setTimeout(() => {
      setRadarScanning(false);
    }, 6000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans parallax-bg">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light rounded-full blur-[100px] -z-10 opacity-60"></div>
        <div className="absolute bottom-12 left-0 w-80 h-80 bg-blue-50 rounded-full blur-[90px] -z-10 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            
            {/* Left Content */}
            <motion.div variants={containerVariants} className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-primary/10 text-primary text-xs font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                <span>Active Emergencies Matching Live</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight leading-tight">
                Find Life-Saving Donors <br className="hidden sm:inline" />
                <span className="text-primary relative inline-block">
                  in Minutes
                  <svg className="absolute left-0 bottom-1 w-full h-2 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                LifeLink AI connects hospitals, donors, and blood banks instantly. Using intelligent geolocation and medical eligibility routing, we slash emergency request times from hours to seconds.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/auth?tab=register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>Become a Donor</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/auth"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-white border border-gray-200 hover:border-gray-300 text-navy-900 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  <span>Request Blood</span>
                </Link>
                <button
                  onClick={triggerRadarScan}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  <Radio size={16} className={radarScanning ? "animate-spin text-primary" : ""} />
                  <span>Scan Nearby Donors</span>
                </button>
              </motion.div>

              {/* Statistics Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">14,280+</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Verified Donors</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">4,812</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Lives Saved</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">120+</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Hospitals Connected</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Interactive Radar Visualizer */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-5 flex justify-center"
            >
              <div className="w-full max-w-[380px] bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50">
                  <div className="flex items-center space-x-2">
                    <Activity className="text-primary animate-pulse" size={18} />
                    <span className="text-xs font-bold text-navy-900">Live AI Matching Radar</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${radarScanning ? 'bg-primary-light text-primary animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                    {radarScanning ? 'SCANNING...' : 'STANDBY'}
                  </span>
                </div>

                <div className="relative bg-slate-50 rounded-2xl p-4 flex justify-center items-center border border-gray-50 aspect-square">
                  <canvas 
                    ref={canvasRef} 
                    width={300} 
                    height={300} 
                    className="w-full h-full max-w-[280px]"
                  />
                  {!radarScanning && radarMatches.length === 0 && (
                    <div className="absolute text-center p-6 bg-white/95 rounded-2xl shadow-sm border border-gray-100 max-w-[220px]">
                      <Radio size={28} className="text-primary mx-auto mb-2 opacity-85" />
                      <p className="text-xs font-bold text-navy-900">Launch Emergency Search</p>
                      <p className="text-[10px] text-slate-500 mt-1">Simulate AI scanning for O- emergency donor matching nearby.</p>
                      <button
                        onClick={triggerRadarScan}
                        className="mt-3 text-[10px] px-3 py-1.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover transition-all"
                      >
                        Trigger Test SOS
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 max-h-[110px] overflow-y-auto">
                  {radarMatches.map((m, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50 border border-gray-50">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="font-bold text-navy-900">{m.name}</span>
                      </div>
                      <div className="flex space-x-2 text-[10px] font-bold text-slate-500">
                        <span className="bg-primary-light text-primary px-1.5 py-0.5 rounded">{m.group}</span>
                        <span>{m.dist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-24 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-900">
              Complete Emergency Coordination Infrastructure
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Every tool required to eliminate discovery delays, secure transactions, and maintain hospital blood networks on one unified portal.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Card 1 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl border border-gray-100 hover:border-primary/20 bg-slatebg hover:bg-white transition-all duration-300 shadow-premium flex flex-col items-start space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">AI Donor Matching</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Intelligently ranks matching profiles based on geographical distance, blood group similarity matrices, donation thresholds, and historical availability.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl border border-gray-100 hover:border-primary/20 bg-slatebg hover:bg-white transition-all duration-300 shadow-premium flex flex-col items-start space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio size={22} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Emergency SOS Alerts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Broadcast instant emergency requirements to suitable nearby donors with automated Twilio SMS integration, emails, and push notifications.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl border border-gray-100 hover:border-primary/20 bg-slatebg hover:bg-white transition-all duration-300 shadow-premium flex flex-col items-start space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin size={22} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Real-Time Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visual coordinate tracking maps which pinpoint nearby active candidates, hospitals, routing directions, and coordinates in real-time.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl border border-gray-100 hover:border-primary/20 bg-slatebg hover:bg-white transition-all duration-300 shadow-premium flex flex-col items-start space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building size={22} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Hospital Integration</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Streamline direct admissions requests, coordinate patient diagnostics data logs, and verify completed blood donations digitally with security checks.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl border border-gray-100 hover:border-primary/20 bg-slatebg hover:bg-white transition-all duration-300 shadow-premium flex flex-col items-start space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart size={22} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Organ Donation Registry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A secure national consent ledger where donors can register organ intents, easily verified by authorized clinical staff in seconds.
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-8 rounded-3xl border border-gray-100 hover:border-primary/20 bg-slatebg hover:bg-white transition-all duration-300 shadow-premium flex flex-col items-start space-y-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity size={22} />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Smart Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Monitor platform metrics, regional demand distributions, live bank inventory shortages, and track historical metrics charts instantly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Donors List Section */}
      <section id="donors" className="py-24 bg-slatebg border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-900">
              Verified Donor Directory
            </h2>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Search and filter our network of certified volunteers ready to respond to local clinical needs.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mb-10 max-w-4xl mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-premium flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:flex-1 relative">
              <input
                type="text"
                placeholder="Search donors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm transition-colors text-navy-900 placeholder-slate-400"
              />
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={filterBlood}
                onChange={(e) => setFilterBlood(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-white transition-colors text-navy-900"
              >
                <option value="All">All Blood Groups</option>
                <option value="O-">O-</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="A+">A+</option>
                <option value="B-">B-</option>
                <option value="B+">B+</option>
                <option value="AB-">AB-</option>
                <option value="AB+">AB+</option>
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={filterAvail}
                onChange={(e) => setFilterAvail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-sm bg-white transition-colors text-navy-900"
              >
                <option value="All">All Availabilities</option>
                <option value="Available">Available</option>
                <option value="Emergency Available">Emergency Only</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Donors Grid */}
          <motion.div 
            layout
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDonors.length > 0 ? (
              filteredDonors.map((donor) => (
                <motion.div
                  layout
                  key={donor.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 12px 20px -3px rgba(0, 0, 0, 0.05)" }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-navy-900">{donor.name}</h4>
                        <p className="text-[10px] text-slate-400 flex items-center mt-0.5">
                          <MapPin size={10} className="mr-1 text-slate-400" />
                          {donor.location}
                        </p>
                      </div>
                      <span className="bg-primary-light text-primary text-xs font-extrabold px-2.5 py-1 rounded-lg">
                        {donor.bloodGroup}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 my-4 text-[10px] text-slate-500 font-semibold">
                      <div>
                        <span className="block text-slate-400 font-normal">Age / Weight</span>
                        <span className="text-navy-900">{donor.age} yrs / {donor.weight} kg</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-normal">Last Donated</span>
                        <span className="text-navy-900">{donor.lastDonationDate || 'Never'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      donor.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                      donor.availability === 'Emergency Available' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {donor.availability}
                    </span>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-navy-900">
                      <Award size={12} className="text-primary" />
                      <span>{donor.impactScore} Pts ({donor.livesSaved} Saved)</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-navy-900">No matching donors found</p>
                <p className="text-[10px] text-slate-500 mt-1">Try adjusting your filters or search query.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section id="impact" className="py-24 bg-slatebg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-navy-900">
                Security-First Design Built For Enterprise Integration
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We protect critical health identifiers with multi-layer encryption, tokenized verification APIs, and detailed system-wide audit logging.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">JWT Token Security</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Role-based API access filters check authorizations strictly.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Eligible Donation Cycles</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Enforces safe 90-day donation cycles. No donor is over-requested.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Digital Audit Trail Logs</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Track and sign every emergency request, verification event, and dispatch step.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Visual Box */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className="bg-navy-900 rounded-3xl glow-navy p-8 text-white relative overflow-hidden"
            >
              <div className="absolute right-0 bottom-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="space-y-6">
                <span className="text-[10px] font-bold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full uppercase border border-primary/20">
                  Mission Statement
                </span>
                <p className="text-xl sm:text-2xl font-light italic leading-relaxed">
                  "LifeLink AI bridges the gap between fear and action in medical crises. By transforming manual calls into sub-second broadcasts, we ensure no hospital bed remains vacant waiting on compatible blood."
                </p>
                <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-primary">LL</div>
                  <div>
                    <h5 className="text-xs font-bold">Dr. Amanda Reynolds</h5>
                    <p className="text-[10px] text-slate-400">Chief of Emergency Medicine, General Health Network</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-extrabold text-navy-900 text-center mb-16"
          >
            Trusted by the Healthcare Community
          </motion.h2>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slatebg border border-gray-100 flex flex-col justify-between"
            >
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Finding O-negative blood in trauma emergencies used to take us 45 minutes of manual calling. With LifeLink AI, we broadcast and match with coordinates in under 90 seconds. Truly life-saving."
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary-light font-bold text-xs text-primary flex items-center justify-center">H</div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Dr. Sarah Jenkins</h4>
                  <p className="text-[9px] text-slate-500">Trauma Director, St. Jude Medical</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slatebg border border-gray-100 flex flex-col justify-between"
            >
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Being registered as a rare blood donor, I felt a sense of responsibility. LifeLink notifies me only when there is a critical eligibility match nearby, avoiding spam calls. It is clean and extremely respectful."
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 font-bold text-xs text-indigo-600 flex items-center justify-center">D</div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Michael Chen</h4>
                  <p className="text-[9px] text-slate-500">Verified Donor, O- Group</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-slatebg border border-gray-100 flex flex-col justify-between"
            >
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "As an NGO coordinator, gathering volunteers for donation drives was a logistics nightmare. LifeLink gives us direct analytics on nearby regional demand shortages and lets us post drives instantly."
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 font-bold text-xs text-teal-600 flex items-center justify-center">N</div>
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Elena Rostova</h4>
                  <p className="text-[9px] text-slate-500">Regional Lead, Hope Blood Alliance</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-navy-900 text-white py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="font-display text-lg font-bold tracking-tight text-white flex items-center">
                LifeLink<span className="text-primary font-extrabold ml-0.5">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Emergency Blood & Organ Network platform connecting healthcare organizations and volunteers in seconds.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Resources</h4>
              <ul className="space-y-2 text-[10px] text-slate-400">
                <li><Link href="/#" className="hover:text-primary transition-colors">API Docs</Link></li>
                <li><Link href="/#" className="hover:text-primary transition-colors">Compatibility Guide</Link></li>
                <li><Link href="/#" className="hover:text-primary transition-colors">Donor Requirements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Support</h4>
              <ul className="space-y-2 text-[10px] text-slate-400">
                <li><Link href="/#" className="hover:text-primary transition-colors">Emergency Contact</Link></li>
                <li><Link href="/#" className="hover:text-primary transition-colors">Privacy Principles</Link></li>
                <li><Link href="/#" className="hover:text-primary transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Contact</h4>
              <p className="text-[10px] text-slate-400">
                Email: support@lifelink.ai<br />
                Emergency Line: +1 (800) LIFELINK
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-[10px] text-slate-400">
            &copy; 2026 LifeLink AI Corporation. Dedicated to connecting lives in seconds.
          </div>
        </div>
      </footer>
    </div>
  );
}
