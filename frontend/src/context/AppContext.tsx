"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types Definition
export type UserRole = 'donor' | 'recipient' | 'hospital' | 'bloodbank' | 'ngo' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  location: string;
  coordinates: { lat: number; lng: number };
}

export interface DonorProfile extends UserProfile {
  bloodGroup: string;
  age: number;
  weight: number;
  lastDonationDate: string;
  availability: 'Available' | 'Unavailable' | 'Emergency Available';
  organDonor: boolean;
  impactScore: number;
  livesSaved: number;
}

export interface EmergencyRequest {
  id: string;
  hospitalName: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: 'Routine' | 'Urgent' | 'CRITICAL (SOS)';
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'Pending' | 'Matching' | 'Notified' | 'Accepted' | 'Completed';
  createdAt: string;
  assignedDonorId?: string;
  matchScore?: number;
}

export interface BloodInventory {
  [bloodGroup: string]: {
    units: number;
    expiryAlerts: number; // units expiring in 7 days
    minThreshold: number;
  };
}

export interface Campaign {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  targetUnits: number;
  collectedUnits: number;
  volunteersCount: number;
  status: 'Upcoming' | 'Active' | 'Completed';
}

export interface SmsLog {
  id: string;
  recipientPhone: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Failed';
}

interface AppContextType {
  currentUser: UserProfile | DonorProfile | null;
  donors: DonorProfile[];
  emergencies: EmergencyRequest[];
  inventory: BloodInventory;
  campaigns: Campaign[];
  smsLogs: SmsLog[];
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  registerDonor: (donorData: Omit<DonorProfile, 'id' | 'role' | 'impactScore' | 'livesSaved'>) => void;
  createEmergency: (request: Omit<EmergencyRequest, 'id' | 'status' | 'createdAt'>) => EmergencyRequest;
  updateInventory: (bloodGroup: string, units: number) => void;
  joinCampaign: (campaignId: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'collectedUnits' | 'volunteersCount' | 'status'>) => void;
  calculateMatches: (bloodGroup: string, requestCoords: { lat: number; lng: number }, urgency: string) => Array<{ donor: DonorProfile; score: number; distance: number }>;
  completeDonation: (emergencyId: string, donorId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Blood Compatibility Matrix
const COMPATIBILITY_MATRIX: { [key: string]: string[] } = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | DonorProfile | null>(null);
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyRequest[]>([]);
  const [inventory, setInventory] = useState<BloodInventory>({});
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);

  // Initialize with robust simulated data on mount
  useEffect(() => {
    // Check local storage first
    const localUser = localStorage.getItem('lifelink_user');
    const localDonors = localStorage.getItem('lifelink_donors');
    const localEmergencies = localStorage.getItem('lifelink_emergencies');
    const localInventory = localStorage.getItem('lifelink_inventory');
    const localCampaigns = localStorage.getItem('lifelink_campaigns');
    const localSms = localStorage.getItem('lifelink_sms');

    if (localUser) setCurrentUser(JSON.parse(localUser));

    // Preset Donors (Simulated coordinates around a city center e.g. New York or similar hub)
    if (localDonors) {
      setDonors(JSON.parse(localDonors));
    } else {
      const initialDonors: DonorProfile[] = [
        {
          id: 'd1', name: 'John Doe', email: 'john@example.com', role: 'donor', phone: '+1 (555) 019-2834',
          location: 'Metro General District', coordinates: { lat: 40.7128, lng: -74.0060 },
          bloodGroup: 'O-', age: 28, weight: 78, lastDonationDate: '2026-02-10', availability: 'Available',
          organDonor: true, impactScore: 92, livesSaved: 4
        },
        {
          id: 'd2', name: 'Jane Smith', email: 'jane@example.com', role: 'donor', phone: '+1 (555) 021-3948',
          location: 'East Side Avenue', coordinates: { lat: 40.7250, lng: -73.9910 },
          bloodGroup: 'A+', age: 34, weight: 64, lastDonationDate: '2026-05-15', availability: 'Emergency Available',
          organDonor: true, impactScore: 78, livesSaved: 2
        },
        {
          id: 'd3', name: 'Carlos Gomez', email: 'carlos@example.com', role: 'donor', phone: '+1 (555) 035-1290',
          location: 'South Plaza Suburb', coordinates: { lat: 40.6900, lng: -74.0200 },
          bloodGroup: 'B+', age: 25, weight: 82, lastDonationDate: '2025-11-20', availability: 'Available',
          organDonor: false, impactScore: 45, livesSaved: 1
        },
        {
          id: 'd4', name: 'Sarah Connor', email: 'sarah@example.com', role: 'donor', phone: '+1 (555) 046-2811',
          location: 'Northside Medical Park', coordinates: { lat: 40.7580, lng: -73.9850 },
          bloodGroup: 'AB-', age: 29, weight: 58, lastDonationDate: '2026-01-05', availability: 'Unavailable',
          organDonor: true, impactScore: 60, livesSaved: 3
        },
        {
          id: 'd5', name: 'David Lee', email: 'david@example.com', role: 'donor', phone: '+1 (555) 098-4422',
          location: 'Central Gardens', coordinates: { lat: 40.7300, lng: -74.0100 },
          bloodGroup: 'O+', age: 42, weight: 85, lastDonationDate: '2026-04-18', availability: 'Emergency Available',
          organDonor: true, impactScore: 110, livesSaved: 6
        },
        {
          id: 'd6', name: 'Elena Rostova', email: 'elena@example.com', role: 'donor', phone: '+1 (555) 077-8899',
          location: 'Riverfront Estates', coordinates: { lat: 40.7050, lng: -73.9700 },
          bloodGroup: 'A-', age: 31, weight: 61, lastDonationDate: '2026-05-01', availability: 'Available',
          organDonor: true, impactScore: 35, livesSaved: 1
        },
        {
          id: 'd7', name: 'Marcus Aurelius', email: 'marcus@example.com', role: 'donor', phone: '+1 (555) 011-2233',
          location: 'Colosseum District', coordinates: { lat: 40.7400, lng: -74.0300 },
          bloodGroup: 'O-', age: 45, weight: 90, lastDonationDate: '2025-08-12', availability: 'Available',
          organDonor: true, impactScore: 180, livesSaved: 9
        }
      ];
      setDonors(initialDonors);
      localStorage.setItem('lifelink_donors', JSON.stringify(initialDonors));
    }

    // Preset Emergencies
    if (localEmergencies) {
      setEmergencies(JSON.parse(localEmergencies));
    } else {
      const initialEmergencies: EmergencyRequest[] = [
        {
          id: 'e1', hospitalName: 'Mercy Sacred Hospital', patientName: 'Robert Vance', bloodGroup: 'O-',
          unitsRequired: 3, urgency: 'CRITICAL (SOS)', location: 'Mercy Hospital, West Wing',
          coordinates: { lat: 40.7150, lng: -74.0090 }, status: 'Notified', createdAt: '2026-06-15T09:40:00Z',
          assignedDonorId: 'd1', matchScore: 98
        },
        {
          id: 'e2', hospitalName: 'City Trauma Care Center', patientName: 'Alice Green', bloodGroup: 'B+',
          unitsRequired: 2, urgency: 'Urgent', location: 'Trauma Unit Bed 14',
          coordinates: { lat: 40.7350, lng: -73.9900 }, status: 'Pending', createdAt: '2026-06-15T10:15:00Z'
        }
      ];
      setEmergencies(initialEmergencies);
      localStorage.setItem('lifelink_emergencies', JSON.stringify(initialEmergencies));
    }

    // Preset Inventory
    if (localInventory) {
      setInventory(JSON.parse(localInventory));
    } else {
      const initialInventory: BloodInventory = {
        'O-': { units: 12, expiryAlerts: 1, minThreshold: 15 },
        'O+': { units: 45, expiryAlerts: 4, minThreshold: 30 },
        'A-': { units: 8, expiryAlerts: 0, minThreshold: 10 },
        'A+': { units: 38, expiryAlerts: 3, minThreshold: 25 },
        'B-': { units: 6, expiryAlerts: 2, minThreshold: 8 },
        'B+': { units: 27, expiryAlerts: 1, minThreshold: 20 },
        'AB-': { units: 3, expiryAlerts: 1, minThreshold: 5 },
        'AB+': { units: 19, expiryAlerts: 0, minThreshold: 10 },
      };
      setInventory(initialInventory);
      localStorage.setItem('lifelink_inventory', JSON.stringify(initialInventory));
    }

    // Preset Campaigns
    if (localCampaigns) {
      setCampaigns(JSON.parse(localCampaigns));
    } else {
      const initialCampaigns: Campaign[] = [
        {
          id: 'c1', title: 'Annual Metropolitan Blood Drive', organizer: 'Red Cross Allied',
          date: '2026-06-20', location: 'Town Hall Central Square', targetUnits: 150,
          collectedUnits: 0, volunteersCount: 42, status: 'Upcoming'
        },
        {
          id: 'c2', title: 'Organ Donation Registration Fair', organizer: 'LifeGift Foundation',
          date: '2026-06-15', location: 'University Medical Campus', targetUnits: 80,
          collectedUnits: 45, volunteersCount: 18, status: 'Active'
        }
      ];
      setCampaigns(initialCampaigns);
      localStorage.setItem('lifelink_campaigns', JSON.stringify(initialCampaigns));
    }

    // Preset SMS Logs
    if (localSms) {
      setSmsLogs(JSON.parse(localSms));
    } else {
      const initialSms: SmsLog[] = [
        {
          id: 's1', recipientPhone: '+1 (555) 019-2834',
          message: 'LIFELINK SOS: Emergency O- blood needed at Mercy Sacred Hospital. Distance: 0.6 km. Respond YES to accept.',
          timestamp: '2026-06-15T09:41:00Z', status: 'Delivered'
        }
      ];
      setSmsLogs(initialSms);
      localStorage.setItem('lifelink_sms', JSON.stringify(initialSms));
    }
  }, []);

  // Save to LocalStorage helpers
  const saveDonors = (data: DonorProfile[]) => {
    setDonors(data);
    localStorage.setItem('lifelink_donors', JSON.stringify(data));
  };

  const saveEmergencies = (data: EmergencyRequest[]) => {
    setEmergencies(data);
    localStorage.setItem('lifelink_emergencies', JSON.stringify(data));
  };

  const saveInventory = (data: BloodInventory) => {
    setInventory(data);
    localStorage.setItem('lifelink_inventory', JSON.stringify(data));
  };

  const saveCampaigns = (data: Campaign[]) => {
    setCampaigns(data);
    localStorage.setItem('lifelink_campaigns', JSON.stringify(data));
  };

  const saveSms = (data: SmsLog[]) => {
    setSmsLogs(data);
    localStorage.setItem('lifelink_sms', JSON.stringify(data));
  };

  // Auth Operations
  const login = (email: string, role: UserRole): boolean => {
    let mockUser: UserProfile | DonorProfile;
    
    if (role === 'donor') {
      const match = donors.find(d => d.email.toLowerCase() === email.toLowerCase());
      if (match) {
        mockUser = match;
      } else {
        // Create matching fallback donor
        mockUser = {
          id: 'd_temp', name: 'Sample Donor', email, role: 'donor', phone: '+1 (555) 123-4567',
          location: 'Green Valley, Sector 4', coordinates: { lat: 40.7180, lng: -74.0020 },
          bloodGroup: 'O+', age: 30, weight: 72, lastDonationDate: '2026-03-01', availability: 'Available',
          organDonor: true, impactScore: 10, livesSaved: 0
        };
        saveDonors([...donors, mockUser as DonorProfile]);
      }
    } else {
      mockUser = {
        id: `u_${role}`,
        email,
        name: role.charAt(0).toUpperCase() + role.slice(1) + ' Coordinator',
        role,
        phone: '+1 (555) 999-8888',
        location: 'City Medical Hub',
        coordinates: { lat: 40.7128, lng: -74.0060 }
      };
    }
    
    setCurrentUser(mockUser);
    localStorage.setItem('lifelink_user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lifelink_user');
  };

  const registerDonor = (donorData: Omit<DonorProfile, 'id' | 'role' | 'impactScore' | 'livesSaved'>) => {
    const newDonor: DonorProfile = {
      ...donorData,
      id: `d_${Date.now()}`,
      role: 'donor',
      impactScore: 0,
      livesSaved: 0
    };
    const updated = [...donors, newDonor];
    saveDonors(updated);
    setCurrentUser(newDonor);
    localStorage.setItem('lifelink_user', JSON.stringify(newDonor));
  };

  // Create Emergency SOS & Trigger AI Engine
  const createEmergency = (request: Omit<EmergencyRequest, 'id' | 'status' | 'createdAt'>): EmergencyRequest => {
    const newRequest: EmergencyRequest = {
      ...request,
      id: `e_${Date.now()}`,
      status: 'Matching',
      createdAt: new Date().toISOString()
    };

    const updated = [newRequest, ...emergencies];
    saveEmergencies(updated);

    // Simulate AI Discovery
    setTimeout(() => {
      // Find matches
      const matches = calculateMatches(request.bloodGroup, request.coordinates, request.urgency);
      
      if (matches.length > 0) {
        const topMatch = matches[0];
        
        // Update request status to Notified and assign top donor
        const modifiedRequests = updated.map(req => {
          if (req.id === newRequest.id) {
            return {
              ...req,
              status: 'Notified' as const,
              assignedDonorId: topMatch.donor.id,
              matchScore: Math.round(topMatch.score)
            };
          }
          return req;
        });
        saveEmergencies(modifiedRequests);

        // Simulate Twilio SMS Dispatch
        const newSms: SmsLog = {
          id: `s_${Date.now()}`,
          recipientPhone: topMatch.donor.phone,
          message: `LIFELINK CRITICAL SOS: Patient ${request.patientName} requires ${request.unitsRequired} units of ${request.bloodGroup} at ${request.hospitalName}. Match Score: ${Math.round(topMatch.score)}%. Distance: ${topMatch.distance.toFixed(1)} km. Reply YES to accept donation invitation.`,
          timestamp: new Date().toISOString(),
          status: 'Sent'
        };
        saveSms([newSms, ...smsLogs]);
      } else {
        // Change state to Pending if no donor matches
        const modifiedRequests = updated.map(req => {
          if (req.id === newRequest.id) return { ...req, status: 'Pending' as const };
          return req;
        });
        saveEmergencies(modifiedRequests);
      }
    }, 2000);

    return newRequest;
  };

  // Inventory Management
  const updateInventory = (bloodGroup: string, units: number) => {
    if (inventory[bloodGroup]) {
      const updated = {
        ...inventory,
        [bloodGroup]: {
          ...inventory[bloodGroup],
          units: Math.max(0, units)
        }
      };
      saveInventory(updated);
    }
  };

  // NGO Campaign actions
  const joinCampaign = (campaignId: string) => {
    const updated = campaigns.map(c => {
      if (c.id === campaignId) {
        return { ...c, volunteersCount: c.volunteersCount + 1 };
      }
      return c;
    });
    saveCampaigns(updated);
  };

  const createCampaign = (campaign: Omit<Campaign, 'id' | 'collectedUnits' | 'volunteersCount' | 'status'>) => {
    const newCamp: Campaign = {
      ...campaign,
      id: `c_${Date.now()}`,
      collectedUnits: 0,
      volunteersCount: 0,
      status: 'Upcoming'
    };
    saveCampaigns([newCamp, ...campaigns]);
  };

  // AI Matching Engine simulation
  // Computes Match Score using formula:
  // Score = BloodGroupCompatibility (50%) + DistanceFactor (30%) + AvailabilityStatus (20%)
  // Negates score if last donation was less than 3 months ago (90 days)
  const calculateMatches = (
    bloodGroup: string,
    requestCoords: { lat: number; lng: number },
    urgency: string
  ): Array<{ donor: DonorProfile; score: number; distance: number }> => {
    
    // Haversine formula to compute distance in km
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth radius
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const compatibleGroups = COMPATIBILITY_MATRIX[bloodGroup] || [];

    const scoredDonors = donors
      .map(donor => {
        // 1. Blood Group Compatibility (50 pts)
        let compatibilityScore = 0;
        if (donor.bloodGroup === bloodGroup) {
          compatibilityScore = 50; // Exact match
        } else if (compatibleGroups.includes(donor.bloodGroup)) {
          compatibilityScore = 35; // Compatible (e.g. O- donating to A+)
        } else {
          compatibilityScore = 0; // Incompatible
        }

        // 2. Distance Score (30 pts)
        const dist = getDistance(requestCoords.lat, requestCoords.lng, donor.coordinates.lat, donor.coordinates.lng);
        // Max distance evaluated: 15km. Score decreases linearly.
        const distanceScore = Math.max(0, 30 * (1 - dist / 15));

        // 3. Availability Score (20 pts)
        let availabilityScore = 0;
        if (donor.availability === 'Emergency Available') {
          availabilityScore = 20;
        } else if (donor.availability === 'Available') {
          availabilityScore = 15;
        }

        // 4. Eligibility Filter (Mandatory 90 days threshold)
        const lastDon = new Date(donor.lastDonationDate);
        const diffDays = Math.floor((new Date().getTime() - lastDon.getTime()) / (1000 * 3600 * 24));
        const eligible = diffDays >= 90;

        // Final score
        let finalScore = compatibilityScore + distanceScore + availabilityScore;
        
        // Penalize score if ineligible or unavailable
        if (!eligible) finalScore *= 0.1; // extreme penalty
        if (donor.availability === 'Unavailable') finalScore *= 0.2;

        return {
          donor,
          score: Math.min(100, finalScore),
          distance: dist
        };
      })
      // Filter out total mismatches
      .filter(item => item.score > 15)
      // Sort by highest score first
      .sort((a, b) => b.score - a.score);

    return scoredDonors;
  };

  const completeDonation = (emergencyId: string, donorId: string) => {
    // Mark emergency request as Completed
    const updatedEmergencies = emergencies.map(req => {
      if (req.id === emergencyId) return { ...req, status: 'Completed' as const };
      return req;
    });
    saveEmergencies(updatedEmergencies);

    // Increment donor impact scores
    const updatedDonors = donors.map(d => {
      if (d.id === donorId) {
        return {
          ...d,
          livesSaved: d.livesSaved + 1,
          impactScore: d.impactScore + 25,
          lastDonationDate: new Date().toISOString().split('T')[0],
          availability: 'Unavailable' as const // temporarily unavailable right after donating
        };
      }
      return d;
    });
    saveDonors(updatedDonors);

    // If current user is the completed donor, update their session info
    if (currentUser && currentUser.id === donorId) {
      const updatedUser = updatedDonors.find(d => d.id === donorId);
      if (updatedUser) {
        setCurrentUser(updatedUser);
        localStorage.setItem('lifelink_user', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      donors,
      emergencies,
      inventory,
      campaigns,
      smsLogs,
      login,
      logout,
      registerDonor,
      createEmergency,
      updateInventory,
      joinCampaign,
      createCampaign,
      calculateMatches,
      completeDonation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
