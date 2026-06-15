"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp, UserRole } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import { Shield, Key, Mail, Phone, MapPin, Heart, ArrowRight, Check, AlertCircle } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, registerDonor, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('donor');

  // Form States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [age, setAge] = useState(25);
  const [weight, setWeight] = useState(70);
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [location, setLocation] = useState('Central District');
  const [organDonor, setOrganDonor] = useState(false);
  const [password, setPassword] = useState('');

  // OTP States
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // General feedback
  const [formError, setFormError] = useState('');

  // Handle URL tabs redirect
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  // If user is already logged in, redirect them to their dashboard
  useEffect(() => {
    if (currentUser) {
      router.push(`/dashboard/${currentUser.role}`);
    }
  }, [currentUser, router]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email) {
      setFormError('Please fill in your email address.');
      return;
    }

    if (activeTab === 'login') {
      // Trigger SMS OTP Simulation
      setShowOtp(true);
    } else {
      if (!name || !phone) {
        setFormError('Please fill in your name and phone number.');
        return;
      }
      if (age < 18 || age > 65) {
        setFormError('Donor age must be between 18 and 65 years old.');
        return;
      }
      if (weight < 50) {
        setFormError('Donor weight must be at least 50 kg.');
        return;
      }
      // Trigger OTP
      setShowOtp(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    // Let 1234 be the mock verification bypass code
    if (otpCode === '1234' || otpCode === '') {
      if (activeTab === 'login') {
        login(email, role);
        router.push(`/dashboard/${role}`);
      } else {
        registerDonor({
          email,
          name,
          phone,
          location,
          coordinates: { lat: 40.7128 + (Math.random() - 0.5) * 0.1, lng: -74.0060 + (Math.random() - 0.5) * 0.1 },
          bloodGroup,
          age,
          weight,
          lastDonationDate: lastDonationDate || new Date().toISOString().split('T')[0],
          availability: 'Available',
          organDonor
        });
        router.push('/dashboard/donor');
      }
    } else {
      setOtpError('Invalid verification code. Please enter "1234" to demo bypass.');
    }
  };

  return (
    <div className="min-h-screen bg-slatebg flex flex-col font-sans">
      <Navigation />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Background Blur shapes */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-100 rounded-full blur-[90px] -z-10"></div>

        <div className="w-full max-w-[500px] bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 sm:p-8">

          {/* OTP Screen */}
          {showOtp ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900">Enter OTP Verification Code</h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  We've sent a simulated SMS/Email authorization code to your address. For demo evaluation, simply leave it blank or enter <strong className="text-navy-900 font-bold">1234</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="••••"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-36 text-center text-2xl font-bold tracking-[0.7em] py-3 rounded-2xl bg-slate-50 border border-gray-200 focus:border-primary focus:outline-none"
                  />
                </div>

                {otpError && (
                  <div className="flex items-center justify-center space-x-1 text-xs text-red-600">
                    <AlertCircle size={14} />
                    <span>{otpError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  <span>Verify and Authenticate</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              <button
                onClick={() => setShowOtp(false)}
                className="text-xs text-slate-500 hover:text-navy-900 font-semibold"
              >
                Go back to details
              </button>
            </div>
          ) : (
            // Form Selection
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex bg-slate-100 p-1.5 rounded-full">
                <button
                  onClick={() => { setActiveTab('login'); setFormError(''); }}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all ${activeTab === 'login' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'}`}
                >
                  Sign In Portal
                </button>
                <button
                  onClick={() => { setActiveTab('register'); setFormError(''); }}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all ${activeTab === 'register' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-navy-900'}`}
                >
                  Join as Donor
                </button>
              </div>

              <div className="text-center">
                <h2 className="font-display text-xl font-bold text-navy-900">
                  {activeTab === 'login' ? 'Welcome back to LifeLink' : 'Register as a Health Donor'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Role-based credential gateway</p>
              </div>

              {formError && (
                <div className="flex items-center space-x-1.5 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">

                {/* Role Switcher for login */}
                {activeTab === 'login' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                    >
                      <option value="donor">Verified Donor</option>
                      <option value="recipient">Patient / Recipient</option>
                      <option value="hospital">Sacred Hospital Staff</option>
                      <option value="bloodbank">Authorized Blood Bank</option>
                      <option value="ngo">NGO Campaign Manager</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                )}

                {/* Name - only for registration */}
                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Johnathan Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                      required
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="e.g. name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Phone - register */}
                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone (SMS Updates)</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Donor Specific Params */}
                {activeTab === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Age (Years)</label>
                        <input
                          type="number"
                          min={18}
                          max={65}
                          value={age}
                          onChange={(e) => setAge(parseInt(e.target.value))}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Weight (kg)</label>
                        <input
                          type="number"
                          min={45}
                          value={weight}
                          onChange={(e) => setWeight(parseInt(e.target.value))}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Donation Date</label>
                        <input
                          type="date"
                          value={lastDonationDate}
                          onChange={(e) => setLastDonationDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Living Area / Location</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. East Side Suburb"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Organ consent */}
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id="organDonor"
                        checked={organDonor}
                        onChange={(e) => setOrganDonor(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                      />
                      <label htmlFor="organDonor" className="text-xs text-navy-800 font-medium cursor-pointer flex items-center space-x-1">
                        <Heart size={12} className="text-primary fill-primary" />
                        <span>Register as an Organ Donor in national network</span>
                      </label>
                    </div>
                  </>
                )}

                {/* Password input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    {activeTab === 'login' && (
                      <button type="button" className="text-[10px] font-semibold text-primary hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Key size={14} className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-gray-100 focus:border-primary text-xs font-medium text-navy-900 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <span>{activeTab === 'login' ? 'Authenticate Account' : 'Register Secure Profile'}</span>
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="text-center text-[10px] text-slate-500 mt-4 leading-relaxed">
                By continuing, you agree to our HIPAA Data Standards, Privacy Policy, and secure messaging terms.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slatebg flex items-center justify-center font-sans text-navy-900">Loading LifeLink...</div>}>
      <AuthContent />
    </Suspense>
  );
}
