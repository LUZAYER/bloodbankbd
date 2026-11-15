'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Filter,
  Navigation,
  RefreshCw,
  Phone,
  ShieldCheck,
  Clock,
  Heart,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
  X,
  PlusCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { DIVISIONS, DISTRICTS } from '@/data/bangladesh-geo';
import { BLOOD_GROUPS } from '@/lib/blood-compatibility';
import type { MapDonor } from '@/components/map/LiveDonorsMap';

// Dynamically import Leaflet LiveDonorsMap with SSR disabled
const LiveDonorsMap = dynamic(() => import('@/components/map/LiveDonorsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[550px] bg-slate-100 animate-pulse rounded-2xl flex flex-col items-center justify-center text-gray-400">
      <Activity className="w-10 h-10 animate-spin text-blood-600 mb-3" />
      <p className="font-bold text-gray-700">Loading Bangladesh Live Donor Map...</p>
      <p className="text-xs text-gray-500">Connecting coordinates & status feeds</p>
    </div>
  ),
});

export default function LiveMapPage() {
  // Filters State
  const [bloodGroup, setBloodGroup] = useState<string>('all');
  const [divisionId, setDivisionId] = useState<string>('all');
  const [districtId, setDistrictId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE'>('AVAILABLE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number | null>(null);

  // Seeker Geolocation
  const [seekerLocation, setSeekerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);

  // Data & Live Feeds
  const [donors, setDonors] = useState<MapDonor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Modals
  const [contactModalDonor, setContactModalDonor] = useState<MapDonor | null>(null);
  const [requestModalDonor, setRequestModalDonor] = useState<MapDonor | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<boolean>(false);
  const [hospitalInput, setHospitalInput] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [contactPhoneInput, setContactPhoneInput] = useState<string>('');

  // Fetch Live Donors from API
  const fetchDonors = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (bloodGroup !== 'all') params.append('bloodGroup', bloodGroup);
      if (divisionId !== 'all') params.append('divisionId', divisionId);
      if (districtId !== 'all') params.append('districtId', districtId);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (seekerLocation) {
        params.append('lat', seekerLocation.lat.toString());
        params.append('lng', seekerLocation.lng.toString());
        if (radiusKm) params.append('radius', radiusKm.toString());
      }

      const res = await fetch(`/api/donors/live?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setDonors(json.data || []);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to fetch live donors:', err);
    } finally {
      setIsLoading(false);
    }
  }, [bloodGroup, divisionId, districtId, statusFilter, seekerLocation, radiusKm]);

  // Initial Load & Re-fetch when filters change
  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // Auto-refresh timer every 20 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDonors();
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDonors]);

  // Detect Seeker GPS Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setSeekerLocation({ lat, lng });
        setLocationAddress(`GPS: ${lat}, ${lng}`);
        setRadiusKm(25); // Default 25km radius when location is activated
      },
      () => {
        setIsLocating(false);
        alert('Could not retrieve GPS location. You can select your division/district below.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Clear Seeker Location
  const handleClearLocation = () => {
    setSeekerLocation(null);
    setLocationAddress(null);
    setRadiusKm(null);
  };

  // Filter available districts when division changes
  const filteredDistricts = useMemo(() => {
    if (divisionId === 'all') return DISTRICTS;
    return DISTRICTS.filter((d) => d.divisionId === divisionId);
  }, [divisionId]);

  // Search query filter for list view
  const displayDonors = useMemo(() => {
    if (!searchQuery.trim()) return donors;
    const q = searchQuery.toLowerCase();
    return donors.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.areaName.toLowerCase().includes(q) ||
        d.districtName.toLowerCase().includes(q) ||
        d.bloodGroup.toLowerCase().includes(q)
    );
  }, [donors, searchQuery]);

  // Counts
  const availableCount = useMemo(() => donors.filter((d) => d.isClinicallyAvailable).length, [donors]);
  const cooldownCount = useMemo(() => donors.filter((d) => d.isInCooldown).length, [donors]);
  const busyCount = useMemo(() => donors.filter((d) => d.availabilityStatus === 'TEMPORARILY_BUSY').length, [donors]);

  // Submit emergency request modal
  const handleSendEmergencyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalDonor) return;

    try {
      const payload = {
        patientBloodGroup: requestModalDonor.bloodGroup,
        unitsNeeded: 1,
        hospitalName: hospitalInput || 'Local Hospital / Emergency Center',
        divisionId: requestModalDonor.divisionId,
        districtId: requestModalDonor.districtId,
        areaName: requestModalDonor.areaName,
        requiredDate: new Date(),
        emergencyPriority: 'CRITICAL',
        preferredContact: 'PHONE',
        contactPhone: contactPhoneInput || '01811111111',
        notes: patientNotes || `Direct request to ${requestModalDonor.fullName} via Live Donor Map`,
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setRequestSuccess(true);
        setTimeout(() => {
          setRequestSuccess(false);
          setRequestModalDonor(null);
          setHospitalInput('');
          setPatientNotes('');
        }, 2500);
      } else {
        alert('Could not submit request. Please ensure you are logged in or call directly.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-bloody-base text-gray-900 dark:text-rose-100 py-6 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Top Emergency Action Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-blood-700 via-blood-600 to-rose-700 dark:from-bloody-panel dark:via-blood-950/80 dark:to-bloody-base rounded-2xl p-4 sm:p-6 text-white border dark:border-bloody-border shadow-xl shadow-blood-700/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shrink-0">
              <Radio className="w-6 h-6 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Bangladesh Live Blood Donor Map</h1>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>LIVE</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blood-100 font-medium">
                Real-time interactive donor radar across all 64 districts • Click pins to call or request blood
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className={`flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow transition-all ${
                seekerLocation
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blood-700 hover:bg-blood-50'
              }`}
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting...' : seekerLocation ? '📍 Location Active' : 'Find Near Me'}</span>
            </button>

            <Link
              href="/requests/new"
              className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 bg-blood-900/60 hover:bg-blood-900 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Emergency</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filter Toolbar Card */}
        <div className="bg-white dark:bg-bloody-panel rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200 dark:border-bloody-border">
          <div className="space-y-4">
            {/* Blood Group Pills Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-700 dark:text-rose-200 uppercase tracking-wider flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 text-blood-600 fill-blood-600" />
                  <span>Filter Blood Group:</span>
                </span>
                <span className="text-[11px] text-gray-500 dark:text-rose-300/70 font-medium">
                  {bloodGroup === 'all' ? 'Showing all blood types' : `Filtered for ${bloodGroup}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setBloodGroup('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    bloodGroup === 'all'
                      ? 'bg-blood-600 text-white shadow-md shadow-blood-500/20'
                      : 'bg-gray-100 dark:bg-bloody-card text-gray-700 dark:text-rose-200 hover:bg-gray-200 dark:hover:bg-bloody-cardHover'
                  }`}
                >
                  All Types ({donors.length})
                </button>
                {BLOOD_GROUPS.map((bg) => {
                  const count = donors.filter((d) => d.bloodGroup === bg).length;
                  const isSelected = bloodGroup === bg;
                  return (
                    <button
                      key={bg}
                      onClick={() => setBloodGroup(bg)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-blood-600 text-white shadow-md shadow-blood-500/20'
                          : 'bg-white dark:bg-bloody-card text-gray-800 dark:text-rose-200 border border-gray-200 dark:border-bloody-border hover:border-blood-300 dark:hover:border-red-700 hover:bg-blood-50/50 dark:hover:bg-bloody-cardHover'
                      }`}
                    >
                      <span>{bg}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-blood-950/80 text-gray-600 dark:text-rose-300'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Geographic & Status Dropdowns Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100 dark:border-bloody-border">
              {/* Division */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-rose-300 mb-1">Division</label>
                <select
                  value={divisionId}
                  onChange={(e) => {
                    setDivisionId(e.target.value);
                    setDistrictId('all');
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-xl text-gray-900 dark:text-rose-100 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  <option value="all">All 8 Divisions</option>
                  {DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                      {div.name} ({div.bnName})
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-rose-300 mb-1">District</label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-xl text-gray-900 dark:text-rose-100 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  <option value="all">All Districts ({filteredDistricts.length})</option>
                  {filteredDistricts.map((d) => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                      {d.name} ({d.bnName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-rose-300 mb-1">Availability Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-xl text-gray-900 dark:text-rose-100 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                >
                  <option value="AVAILABLE" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">Available Now Only</option>
                  <option value="ALL" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">All Donors (inc. Cooldown)</option>
                </select>
              </div>

              {/* Radius Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-rose-300 mb-1">Search Distance</label>
                <select
                  value={radiusKm || 'all'}
                  onChange={(e) => setRadiusKm(e.target.value === 'all' ? null : Number(e.target.value))}
                  disabled={!seekerLocation}
                  className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-xl text-gray-900 dark:text-rose-100 focus:ring-2 focus:ring-blood-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="all">Nationwide (All)</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>

              {/* Refresh & Count info */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => fetchDonors()}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-bloody-card hover:bg-slate-200 dark:hover:bg-bloody-cardHover text-gray-700 dark:text-rose-200 border dark:border-bloody-border rounded-xl text-xs font-bold transition-colors"
                  title="Force refresh live markers"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blood-600' : ''}`} />
                  <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    autoRefresh
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-50 dark:bg-bloody-card text-gray-500 dark:text-rose-300/60 border-gray-200 dark:border-bloody-border'
                  }`}
                  title="Toggle automatic live marker refresh"
                >
                  {autoRefresh ? 'Live ON' : 'Paused'}
                </button>
              </div>
            </div>

            {/* Active Seeker Location Banner */}
            {seekerLocation && (
              <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="font-bold">Proximity Radar Active:</span>
                  <span>{locationAddress}</span>
                  {radiusKm && <span className="bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded font-bold">Within {radiusKm} km</span>}
                </div>
                <button
                  onClick={handleClearLocation}
                  className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white font-bold hover:underline"
                >
                  Clear GPS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Counters HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-bloody-card p-3.5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blood-50 dark:bg-blood-950/80 text-blood-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-gray-900 dark:text-white">{donors.length}</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">Donors Plotted</div>
            </div>
          </div>

          <div className="bg-white dark:bg-bloody-card p-3.5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{availableCount}</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">Ready Now</div>
            </div>
          </div>

          <div className="bg-white dark:bg-bloody-card p-3.5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{cooldownCount}</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">In Cooldown</div>
            </div>
          </div>

          <div className="bg-white dark:bg-bloody-card p-3.5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">{busyCount}</div>
              <div className="text-[11px] font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">Temporarily Busy</div>
            </div>
          </div>
        </div>

        {/* Masterclass Split Screen: Map (Right/Main) + List (Left) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Search & Donors List (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-bloody-panel rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex flex-col h-[650px] overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-bloody-border bg-slate-50/60 dark:bg-bloody-card/50">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-rose-400/60" />
                <input
                  type="text"
                  placeholder="Filter by name, area, thana..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-xl text-gray-900 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-rose-300/70">
                <span>Showing {displayDonors.length} matching donors</span>
                {lastUpdated && <span className="text-[10px]">Updated: {lastUpdated}</span>}
              </div>
            </div>

            {/* Scrollable list of donors */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-bloody-border p-2 space-y-1">
              {displayDonors.length === 0 ? (
                <div className="p-8 text-center text-gray-400 dark:text-rose-300/60">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-rose-900/60" />
                  <p className="font-semibold text-xs">No donors matched this filter.</p>
                  <p className="text-[11px] mt-1">Try switching to &quot;All Districts&quot; or clearing radius.</p>
                </div>
              ) : (
                displayDonors.map((donor) => {
                  const isSelected = selectedDonorId === donor.id;
                  return (
                    <div
                      key={donor.id}
                      onClick={() => setSelectedDonorId(donor.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blood-50 dark:bg-blood-950/70 border border-blood-200 dark:border-red-900/80 shadow-sm'
                          : 'hover:bg-slate-50 dark:hover:bg-bloody-cardHover border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2.5">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-sm ${
                              donor.bloodGroup.includes('-') ? 'bg-purple-700' : 'bg-blood-600'
                            }`}
                          >
                            {donor.bloodGroup}
                          </span>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white text-xs flex items-center space-x-1">
                              <span>{donor.fullName}</span>
                              {donor.verificationStatus === 'VERIFIED' && (
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-rose-300/70 font-medium">
                              {donor.areaName}
                            </div>
                            <div className="text-[10px] text-gray-400 dark:text-rose-300/50">
                              {donor.districtName}, {donor.divisionName}
                            </div>
                          </div>
                        </div>

                        {/* Distance pill */}
                        {donor.distanceKm !== null && donor.distanceKm !== undefined && (
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-bloody-card text-slate-700 dark:text-rose-200 border dark:border-bloody-border shrink-0">
                            {donor.distanceKm < 1 ? '<1 km' : `${donor.distanceKm.toFixed(1)} km`}
                          </span>
                        )}
                      </div>

                      {/* Status & action buttons */}
                      <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-bloody-border flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            donor.isClinicallyAvailable
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                              : donor.isInCooldown
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300'
                              : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {donor.isClinicallyAvailable
                            ? '● Available Now'
                            : donor.isInCooldown
                            ? '⏳ Cooldown'
                            : '⚡ Busy'}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          <a
                            href={`tel:${donor.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            title={`Call ${donor.phone}`}
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRequestModalDonor(donor);
                            }}
                            className="bg-blood-600 hover:bg-blood-700 text-white px-2 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm"
                          >
                            Request
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Interactive Leaflet Map (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-gray-200 dark:border-bloody-border shadow-sm">
            <LiveDonorsMap
              donors={donors}
              selectedDonorId={selectedDonorId}
              onSelectDonor={(d) => setSelectedDonorId(d.id)}
              onRequestBlood={(d) => setRequestModalDonor(d)}
              seekerLocation={seekerLocation}
              radiusKm={radiusKm}
              heightClass="h-[650px]"
            />
          </div>
        </div>
      </div>

      {/* Emergency Request Modal */}
      {requestModalDonor && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-bloody-panel rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-bloody-border animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-bloody-border">
              <div className="flex items-center space-x-3">
                <span className="w-10 h-10 rounded-xl bg-blood-600 text-white font-extrabold flex items-center justify-center text-lg shadow">
                  {requestModalDonor.bloodGroup}
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Request Blood from {requestModalDonor.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-rose-300/70">
                    📍 {requestModalDonor.areaName}, {requestModalDonor.districtName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRequestModalDonor(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Request Sent Successfully!</h4>
                <p className="text-xs text-gray-600 dark:text-rose-200/80">
                  Donor alert and SMS notification dispatched. You can also call directly:
                </p>
                <div className="mt-3">
                  <a
                    href={`tel:${requestModalDonor.phone}`}
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {requestModalDonor.phone} Now</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendEmergencyRequest} className="space-y-3.5 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-rose-300 mb-1">
                    Hospital / Clinical Center *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka Medical College, Ward 4"
                    value={hospitalInput}
                    onChange={(e) => setHospitalInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-bloody-card border border-gray-300 dark:border-bloody-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-rose-300 mb-1">
                    Your Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01811111111"
                    value={contactPhoneInput}
                    onChange={(e) => setContactPhoneInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-bloody-card border border-gray-300 dark:border-bloody-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-rose-300 mb-1">
                    Patient Situation / Emergency Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Explain clinical urgency, scheduled operation time, or transfusion details..."
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white dark:bg-bloody-card border border-gray-300 dark:border-bloody-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-200 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Emergency crossmatching and clinical screening must always be conducted by hospital lab personnel prior to transfusion.
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalDonor(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-rose-300/80 hover:bg-gray-100 dark:hover:bg-bloody-card rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-blood-600 hover:bg-blood-700 text-white rounded-xl shadow-md shadow-blood-600/20"
                  >
                    Send Urgent Notification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
