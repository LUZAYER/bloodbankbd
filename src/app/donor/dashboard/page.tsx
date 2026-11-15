'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Bell,
  Check,
  X,
  Phone,
  Edit3,
  Crosshair,
  Navigation,
} from 'lucide-react';
import { evaluateDonorEligibility } from '@/lib/eligibility';

// Dynamically import ProfileLocationPickerMap (SSR false)
const ProfileLocationPickerMap = dynamic(
  () => import('@/components/map/ProfileLocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-500 font-semibold">
        Loading interactive location map...
      </div>
    ),
  }
);

export default function DonorDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Availability Switcher
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Quick Date Update Modal
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [newDonationDate, setNewDonationDate] = useState('');
  const [hospitalName, setHospitalName] = useState('');

  // GPS Map Location State
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [locationSavedSuccess, setLocationSavedSuccess] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      if (!meData.success || meData.user?.role !== 'DONOR') {
        router.push('/login');
        return;
      }

      setProfile(meData.user.donorProfile);
      if (meData.user.donorProfile?.latitude && meData.user.donorProfile?.longitude) {
        setCoords({
          lat: meData.user.donorProfile.latitude,
          lng: meData.user.donorProfile.longitude,
        });
      }
      if (meData.user.donorProfile?.addressDetails) {
        setAddressInput(meData.user.donorProfile.addressDetails);
      }

      // Fetch open requests in donor's district
      if (meData.user.donorProfile?.districtId) {
        const reqRes = await fetch(`/api/requests?districtId=${meData.user.donorProfile.districtId}&status=OPEN`);
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setIncomingRequests(reqData.data || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (newStatus: string) => {
    setUpdatingAvailability(true);
    try {
      const res = await fetch('/api/donor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      if (res.ok) {
        setProfile((prev: any) => ({ ...prev, availabilityStatus: newStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;
    setIsSavingLocation(true);
    try {
      const res = await fetch('/api/donor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.lat,
          longitude: coords.lng,
          addressDetails: addressInput,
        }),
      });
      if (res.ok) {
        setLocationSavedSuccess(true);
        setTimeout(() => setLocationSavedSuccess(false), 3000);
      } else {
        alert('Failed to save profile coordinates.');
      }
    } catch {
      alert('Network error saving location.');
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleQuickDonationLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonationDate || !hospitalName) return;

    try {
      const res = await fetch('/api/donor/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationDate: newDonationDate,
          hospitalName,
          units: 1,
        }),
      });

      if (res.ok) {
        setIsDateModalOpen(false);
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to record donation.');
      }
    } catch {
      alert('Error updating donation date.');
    }
  };

  const handleRespondToRequest = async (requestId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch(`/api/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        alert(`You have ${status.toLowerCase()} this blood request. Seeker has been notified.`);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-blood-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-semibold">Loading your donor profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  // Calculate current eligibility client-side using policy
  const eligibility = evaluateDonorEligibility(
    profile.lastDonationDate,
    profile.availabilityStatus,
    90,
    new Date()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-5">
          <div className="w-16 h-16 rounded-2xl bg-blood-600 text-white flex flex-col items-center justify-center font-black shadow-lg shadow-blood-500/25 flex-shrink-0">
            <span className="text-2xl">{profile.bloodGroup}</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
              Group
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {profile.fullName}
              </h1>
              {profile.verificationStatus === 'VERIFIED' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {profile.areaName}, {profile.upazila?.name || profile.upazilaId},{' '}
                {profile.district?.name || profile.districtId}
              </span>
            </p>
          </div>
        </div>

        {/* Live Availability Toggle Button */}
        <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 self-start md:self-center">
          <span className="text-xs font-bold text-gray-700 pl-2">My Availability:</span>
          <button
            onClick={() => handleToggleAvailability('AVAILABLE')}
            disabled={updatingAvailability}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              profile.availabilityStatus === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => handleToggleAvailability('UNAVAILABLE')}
            disabled={updatingAvailability}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              profile.availabilityStatus === 'UNAVAILABLE'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unavailable
          </button>
        </div>
      </div>

      {/* Grid: Eligibility Status + Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estimated Eligibility Card */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-blood-600" />
              <span>Donation Eligibility & Safety Cooldown</span>
            </span>
            <button
              onClick={() => setIsDateModalOpen(true)}
              className="text-xs font-bold text-blood-600 hover:underline flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Record Recent Donation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    eligibility.isEligible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {eligibility.statusLabel}
                </span>
                {eligibility.daysRemaining > 0 && (
                  <span className="text-xs font-bold text-amber-700">
                    ({eligibility.daysRemaining} days cooldown remaining)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{eligibility.reason}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Last Confirmed Donation:</span>
                <strong className="text-gray-900">
                  {profile.lastDonationDate
                    ? new Date(profile.lastDonationDate).toISOString().split('T')[0]
                    : 'None recorded'}
                </strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Next Eligible Date:</span>
                <strong className="text-blood-700">
                  {profile.nextEligibleDate
                    ? new Date(profile.nextEligibleDate).toISOString().split('T')[0]
                    : 'Eligible Now'}
                </strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Lifetime Donations:</span>
                <strong className="text-gray-900">{profile.totalDonationsCount} times</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Nav / Donor Stats */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-gray-900 text-base mb-1">
              Donor Quick Links
            </h3>
            <p className="text-xs text-gray-500">
              Manage your verified history and notification settings.
            </p>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/donor/history"
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between border border-gray-200 transition-colors"
            >
              <span>View Full Donation History</span>
              <span>→</span>
            </Link>
            <Link
              href="/map"
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between border border-emerald-200 transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>View My Pin on Live Radar</span>
              </span>
              <span>→</span>
            </Link>
            <Link
              href="/notifications"
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between border border-gray-200 transition-colors"
            >
              <span>Notification Preferences</span>
              <span>→</span>
            </Link>
            <Link
              href="/search"
              className="w-full py-2.5 px-4 bg-blood-50 hover:bg-blood-100 rounded-xl text-xs font-bold text-blood-700 flex items-center justify-between border border-blood-200 transition-colors"
            >
              <span>Test Emergency Search</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* GPS Location & Live Pin Setter on Bangladesh Map */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase text-blood-600">
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Location & Map Radar Visibility</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">
              Set Your Current Location on the Map
            </h3>
            <p className="text-xs text-gray-500">
              Seekers and emergency dispatchers in your neighborhood will find you on the Live Radar based on this pin.
            </p>
          </div>

          {locationSavedSuccess && (
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>GPS Pin Saved to Live Radar!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveLocation} className="space-y-4">
          <ProfileLocationPickerMap
            initialLat={profile.latitude || 23.8103}
            initialLng={profile.longitude || 90.4125}
            onChangeLocation={(lat, lng) => setCoords({ lat, lng })}
            heightClass="h-80"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Detailed Street Address / Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 3A, House 14, Road 5, Rankin Street, Wari"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blood-500 focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSavingLocation}
                className="w-full bg-blood-600 hover:bg-blood-700 text-white py-2 px-4 rounded-xl text-xs font-bold shadow-md shadow-blood-600/20 transition-all flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingLocation ? 'Updating Radar...' : 'Save Live Location'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Incoming Emergency Requests in Donor's District */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase text-blood-600">
              <span className="w-2 h-2 rounded-full bg-blood-600 animate-pulse"></span>
              <span>District Emergency Dispatch</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">
              Urgent Requests in {profile.district?.name || profile.districtId}
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blood-50 text-blood-700 rounded-full border border-blood-200">
            {incomingRequests.length} Active Request(s)
          </span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            No active emergency blood requests in your district right now. Thank you for being ready!
          </div>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blood-600 text-white flex flex-col items-center justify-center font-extrabold flex-shrink-0">
                    <span className="text-base">{req.patientBloodGroup}</span>
                    <span className="text-[8px] uppercase">Needed</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-gray-900">{req.hospitalName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                        {req.emergencyPriority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Location: {req.areaName}, {req.upazila?.name || req.upazilaId} • Units Needed: {req.unitsNeeded}
                    </p>
                    {req.notes && (
                      <p className="text-xs text-gray-500 italic">"{req.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRespondToRequest(req.id, 'ACCEPTED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept & Assist</span>
                  </button>
                  <button
                    onClick={() => handleRespondToRequest(req.id, 'DECLINED')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Donation Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-gray-900">Record a Blood Donation</h3>
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickDonationLog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Donation Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDonationDate}
                  onChange={(e) => setNewDonationDate(e.target.value)}
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Hospital or Blood Center *
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Dhaka Medical College Hospital"
                  className="w-full text-sm font-medium rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                />
              </div>

              <p className="text-[11px] text-gray-500">
                Updating your last donation date resets your 90-day cooldown period for your physical health and donor safety.
              </p>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDateModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
