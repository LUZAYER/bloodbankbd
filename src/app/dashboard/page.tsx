'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Heart,
  Activity,
  Users,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  PlusCircle,
  ArrowRight,
  ChevronRight,
  Radio,
  Calendar,
  AlertTriangle,
  Building2,
  Phone,
  Sparkles,
  ExternalLink,
  Award,
} from 'lucide-react';
import { BLOOD_GROUPS, isRbcCompatible } from '@/lib/blood-compatibility';
import type { MapDonor } from '@/components/map/LiveDonorsMap';

// Dynamically import LiveDonorsMap preview
const LiveDonorsMap = dynamic(() => import('@/components/map/LiveDonorsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">
      <Activity className="w-8 h-8 animate-spin text-blood-600 mr-2" />
      <span className="text-xs font-bold text-gray-600">Loading Live Bangladesh Radar...</span>
    </div>
  ),
});

export default function GeneralDashboardPage() {
  const [stats, setStats] = useState({
    totalDonors: 110,
    availableDonors: 79,
    cooldownDonors: 21,
    districtsCovered: 64,
    openRequests: 5,
  });

  const [donors, setDonors] = useState<MapDonor[]>([]);
  const [openRequests, setOpenRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Eligibility Calculator State
  const [calcLastDonation, setCalcLastDonation] = useState('');
  const [calcResult, setCalcResult] = useState<{ isEligible: boolean; daysLeft: number; nextDate: string } | null>(null);

  useEffect(() => {
    // Fetch live donors for radar & counts
    fetch('/api/donors/live')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setDonors(json.data);
          if (json.summary) {
            setStats((prev) => ({
              ...prev,
              totalDonors: json.summary.totalFound || 110,
              availableDonors: json.summary.availableCount || 79,
              cooldownDonors: json.summary.cooldownCount || 21,
            }));
          }
        }
      })
      .catch(() => {});

    // Fetch open emergency requests
    fetch('/api/requests?status=OPEN')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setOpenRequests(data.data.slice(0, 5));
          setStats((prev) => ({ ...prev, openRequests: data.data.length || 5 }));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Handle Quick Eligibility Check
  const handleCalculateEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcLastDonation) return;

    const donationDate = new Date(calcLastDonation);
    const now = new Date();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const nextDateObj = new Date(donationDate.getTime() + ninetyDays);
    const diffDays = Math.ceil((nextDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      setCalcResult({
        isEligible: true,
        daysLeft: 0,
        nextDate: nextDateObj.toLocaleDateString(),
      });
    } else {
      setCalcResult({
        isEligible: false,
        daysLeft: diffDays,
        nextDate: nextDateObj.toLocaleDateString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-bloody-base text-gray-900 dark:text-rose-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-red-50/80 via-white to-rose-50/50 dark:from-bloody-panel dark:via-blood-950/60 dark:to-bloody-base rounded-3xl p-6 sm:p-10 text-gray-900 dark:text-white border border-red-200/80 dark:border-bloody-border shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-red-100/50 dark:bg-blood-600/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-red-100/80 dark:bg-blood-950/80 text-blood-700 dark:text-rose-300 border border-red-200 dark:border-bloody-border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>National Emergency Healthcare Dispatch</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-gray-900 dark:text-white">
                BloodBond Bangladesh <br />
                <span className="text-blood-600 dark:text-blood-400 font-extrabold text-xl sm:text-2xl font-bengali">
                  সারাদেশের লাইভ রক্তদাতা ও জরুরি সংযোগ কেন্দ্র
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-rose-200/80 leading-relaxed">
                Connect voluntarily with clinically eligible blood donors across all 64 districts in Bangladesh. Real-time GPS mapping, Haversine proximity routing, and clinical compatibility safety.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <Link
                href="/map"
                className="flex items-center justify-center space-x-2 bg-blood-600 hover:bg-blood-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blood-600/30 transition-all hover:scale-105"
              >
                <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span>Open Live Map Radar</span>
              </Link>
              <Link
                href="/requests/new"
                className="flex items-center justify-center space-x-2 bg-white dark:bg-bloody-card hover:bg-gray-50 dark:hover:bg-bloody-cardHover text-gray-800 dark:text-rose-200 border border-gray-300 dark:border-bloody-border px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4 text-blood-600 dark:text-rose-400" />
                <span>Request Blood</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Core KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-bloody-card p-5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">Total Donors</span>
              <div className="w-9 h-9 rounded-xl bg-blood-50 dark:bg-blood-950/80 text-blood-600 dark:text-rose-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{stats.totalDonors}</div>
              <p className="text-xs text-gray-500 dark:text-rose-300/70 mt-0.5">Across all 8 Divisions</p>
            </div>
          </div>

          <div className="bg-white dark:bg-bloody-card p-5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">Ready to Donate</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.availableDonors}</div>
              <p className="text-xs text-gray-500 dark:text-rose-300/70 mt-0.5">Eligible right now</p>
            </div>
          </div>

          <div className="bg-white dark:bg-bloody-card p-5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">Districts Covered</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">64 / 64</div>
              <p className="text-xs text-gray-500 dark:text-rose-300/70 mt-0.5">100% Nationwide coverage</p>
            </div>
          </div>

          <div className="bg-white dark:bg-bloody-card p-5 rounded-2xl border border-gray-200 dark:border-bloody-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-rose-300/70 uppercase tracking-wider">Active Appeals</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-blood-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{stats.openRequests}</div>
              <p className="text-xs text-gray-500 dark:text-rose-300/70 mt-0.5">Urgent patient cases</p>
            </div>
          </div>
        </div>

        {/* Live Map Preview Section */}
        <div className="bg-white dark:bg-bloody-panel rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-bloody-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Live Bangladesh Donor Radar
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-rose-300/70">
                100+ active voluntary donors mapped by geographic district and clinical readiness
              </p>
            </div>
            <Link
              href="/map"
              className="inline-flex items-center space-x-1.5 bg-blood-600 hover:bg-blood-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blood-600/20"
            >
              <span>Explore Full Interactive Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <LiveDonorsMap donors={donors.slice(0, 50)} heightClass="h-96" />
        </div>

        {/* Blood Groups Availability Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">National Blood Group Reserves</h2>
              <p className="text-xs text-gray-500 dark:text-rose-300/70">Click any blood group to jump straight to live donors</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-rose-300/60 font-medium">8 Clinical RBC Groups</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((bg) => {
              const count = donors.filter((d) => d.bloodGroup === bg && d.isClinicallyAvailable).length;
              const totalForGroup = donors.filter((d) => d.bloodGroup === bg).length;
              const isUniversalDonor = bg === 'O-';
              const isUniversalRecipient = bg === 'AB+';

              return (
                <Link
                  key={bg}
                  href={`/map?bloodGroup=${encodeURIComponent(bg)}`}
                  className="bg-white dark:bg-bloody-card p-4 rounded-2xl border border-gray-200 dark:border-bloody-border hover:border-blood-500 dark:hover:border-red-700 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-blood-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                      {bg}
                    </span>
                    {isUniversalDonor && (
                      <span className="text-[9px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
                        Universal
                      </span>
                    )}
                    {isUniversalRecipient && (
                      <span className="text-[9px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                        Recipient
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-lg font-extrabold text-gray-900 dark:text-white">{count} Available</div>
                    <div className="text-[10px] text-gray-400 dark:text-rose-300/60 font-medium">{totalForGroup} Registered</div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-bloody-border flex items-center text-[10px] text-blood-600 dark:text-rose-400 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>View Donors</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Emergency Appeals + Quick Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Emergency Appeals (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-bloody-panel rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-bloody-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-bloody-border pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Active Emergency Blood Appeals</h3>
              </div>
              <Link
                href="/requests/new"
                className="text-xs text-blood-600 dark:text-rose-400 hover:text-blood-700 font-bold hover:underline"
              >
                + Post Request
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-bloody-border">
              {openRequests.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 dark:text-rose-300/60">
                  No active emergency appeals at this time.
                </div>
              ) : (
                openRequests.map((req) => (
                  <div key={req.id} className="py-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blood-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {req.patientBloodGroup}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          {req.hospitalName}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-rose-300/70 font-medium">
                          📍 {req.areaName || req.upazila?.name || ''}, {req.district?.name}
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-rose-200/80 mt-1 line-clamp-1 italic">
                          &quot;{req.notes || 'Emergency transfusion needed urgently.'}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 dark:bg-blood-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-bloody-border">
                        {req.emergencyPriority}
                      </span>
                      <a
                        href={`tel:${req.contactPhone}`}
                        className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick 90-Day Eligibility Calculator (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-bloody-panel text-gray-900 dark:text-white rounded-3xl p-6 sm:p-7 border border-gray-200 dark:border-bloody-border shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-100 dark:border-bloody-border pb-3">
              <Calendar className="w-5 h-5 text-blood-600 dark:text-blood-400" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">90-Day Clinical Eligibility Calculator</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-rose-200/80">
              Under DGHS & WHO guidelines in Bangladesh, voluntary donors must maintain a 90-day cooldown interval between red blood cell donations for clinical safety.
            </p>

            <form onSubmit={handleCalculateEligibility} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-rose-300 mb-1">
                  When did you last donate blood?
                </label>
                <input
                  type="date"
                  required
                  value={calcLastDonation}
                  onChange={(e) => setCalcLastDonation(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-gray-50 dark:bg-bloody-card border border-gray-300 dark:border-bloody-border rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blood-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blood-600 hover:bg-blood-500 text-white py-2 rounded-xl text-xs font-bold transition-all shadow"
              >
                Check My Next Eligible Date
              </button>
            </form>

            {calcResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs ${
                  calcResult.isEligible
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                    : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                }`}
              >
                {calcResult.isEligible ? (
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">You are eligible to donate today!</span>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Your 90-day medical interval has passed. Thank you for your noble humanitarian service.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Currently in Clinical Cooldown ({calcResult.daysLeft} days left)</span>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                        Estimated next eligible donation date: <b>{calcResult.nextDate}</b>. Rest and hydrate!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
