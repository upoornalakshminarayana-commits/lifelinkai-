"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp, UserRole } from '@/context/AppContext';
import { Heart, Activity, User, LogOut, ChevronDown, Layers, MapPin } from 'lucide-react';

export default function Navigation() {
  const { currentUser, login, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const handleRoleSwitch = (role: UserRole) => {
    login(`${role}@lifelink.ai`, role);
    setRoleMenuOpen(false);
    router.push(`/dashboard/${role}`);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Donors List', path: '/#donors' },
    { name: 'Campaigns', path: '/#impact' }
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-100 shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-navy-900 flex items-center">
                LifeLink<span className="text-primary font-extrabold ml-0.5">AI</span>
              </span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-navy-700 hover:text-primary transition-colors text-sm font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Options */}
          <div className="flex items-center space-x-4">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all shadow-sm"
              >
                <Layers size={13} />
                <span>Demo Roles</span>
                <ChevronDown size={12} />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-gray-100 shadow-xl py-2 z-50 text-navy-900">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Switch Dashboard View
                  </div>
                  {(['donor', 'recipient', 'hospital', 'bloodbank', 'ngo', 'admin'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 flex items-center justify-between group transition-colors"
                    >
                      <span className="capitalize">{role === 'bloodbank' ? 'Blood Bank' : role}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors"></span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-sm font-semibold text-navy-800 hover:text-primary transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold border border-primary/20">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">{currentUser.name}</span>
                  <ChevronDown size={14} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logged In As</p>
                      <p className="text-sm font-semibold text-navy-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-navy-700 capitalize flex items-center space-x-1 mt-0.5">
                        <Activity size={10} className="text-primary" />
                        <span>Role: {currentUser.role === 'bloodbank' ? 'Blood Bank' : currentUser.role}</span>
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/${currentUser.role}`}
                      className="px-4 py-2.5 text-xs text-navy-800 hover:bg-gray-50 flex items-center space-x-2 transition-colors font-medium"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={14} className="text-navy-700" />
                      <span>My Dashboard</span>
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        router.push('/');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors font-medium"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-navy-900 hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?tab=register"
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-white transition-all shadow-sm"
                >
                  Register Donor
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
