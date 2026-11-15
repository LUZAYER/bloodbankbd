'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Search,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Users,
  Activity,
  ArrowRight,
  Radio,
  PlusCircle,
  ChevronRight,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { DIVISIONS, DISTRICTS } from '@/data/bangladesh-geo';
import { BLOOD_GROUPS } from '@/lib/blood-compatibility';

export default function HomePage() {
  const router = useRouter();

  // Search Capsule State
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [selectedDistrict, setSelectedDistrict] = useState('dhaka');
  const [searchMode, setSearchMode] = useState<'standard' | 'ai'>('standard');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Live Stats & Data Feeds
  const [stats, setStats] = useState({
    totalDonors: 110,
    availableDonors: 79,
    districtsCovered: 64,
    openRequests: 5,
  });

  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live summary stats
    fetch('/api/donors/live')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.summary) {
          setStats((prev) => ({
            ...prev,
            totalDonors: json.summary.totalFound || 110,
            availableDonors: json.summary.availableCount || 79,
          }));
        }
      })
      .catch(() => {});

    // Fetch open appeals
    fetch('/api/requests?status=OPEN')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setRecentRequests(data.data.slice(0, 3));
          setStats((prev) => ({ ...prev, openRequests: data.data.length }));
        }
      })
      .catch(() => {});
  }, []);

  const handleStandardSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?bloodGroup=${encodeURIComponent(selectedBloodGroup)}&districtId=${selectedDistrict}`);
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/parse-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiPrompt }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const parsed = data.data;
        const params = new URLSearchParams();
        if (parsed.bloodGroup) params.set('bloodGroup', parsed.bloodGroup);
        if (parsed.divisionId) params.set('divisionId', parsed.divisionId);
        if (parsed.districtId) params.set('districtId', parsed.districtId);
        if (parsed.areaName) params.set('areaName', parsed.areaName);
        if (parsed.urgency) params.set('urgency', parsed.urgency);
        router.push(`/search?${params.toString()}`);
      } else {
        router.push(`/search?areaName=${encodeURIComponent(aiPrompt)}`);
      }
    } catch {
      router.push(`/search?areaName=${encodeURIComponent(aiPrompt)}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-bloody-base text-gray-900 dark:text-rose-100 transition-colors duration-300 selection:bg-blood-600 selection:text-white">
      {/* Background Decorative Mesh Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-100/40 via-rose-50/20 to-transparent dark:from-blood-900/30 dark:via-rose-950/20 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-20 space-y-16 sm:space-y-24">
        {/* ========================================================= */}
        {/* HERO SECTION: Minimal, Clean, High-Impact Typography     */}
        {/* ========================================================= */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          {/* Live Status Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-bloody-panel border border-red-200/80 dark:border-bloody-border text-xs text-blood-800 dark:text-rose-200 shadow-sm dark:shadow-lg dark:shadow-blood-950/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wide">
              National Emergency Blood Network • 64 Districts Active
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.08]">
            When Seconds Count, <br />
            <span className="bg-gradient-to-r from-blood-600 via-rose-600 to-red-500 dark:from-red-500 dark:via-rose-500 dark:to-red-400 bg-clip-text text-transparent">
              Every Drop Connects.
            </span>
          </h1>

          {/* Subtitle with Bengali nuance */}
          <p className="text-sm sm:text-base text-gray-600 dark:text-rose-200/80 max-w-2xl mx-auto leading-relaxed font-normal">
            Direct voluntary donor discovery across Bangladesh. Clinical compatibility gating, 90-day cooldown safety, and real-time GPS proximity matching.
          </p>

          {/* Primary Quick Navigation Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/map"
              className="group flex items-center space-x-2 bg-blood-600 hover:bg-blood-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blood-600/25 transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>Launch Live Donor Map</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center space-x-2 bg-white dark:bg-bloody-card hover:bg-gray-50 dark:hover:bg-bloody-cardHover text-gray-800 dark:text-rose-200 border border-gray-300 dark:border-bloody-border hover:border-gray-400 dark:hover:border-red-900 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm"
            >
              <Activity className="w-4 h-4 text-blood-600 dark:text-rose-400" />
              <span>General Dashboard</span>
            </Link>

            <Link
              href="/requests/new"
              className="flex items-center space-x-2 bg-red-50 dark:bg-blood-950/40 hover:bg-red-100 dark:hover:bg-blood-950/70 text-blood-700 dark:text-rose-300 border border-red-200 dark:border-bloody-border px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Emergency Appeal</span>
            </Link>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FLOATING SEARCH CAPSULE: Unified, Sleek & Intuitive       */}
        {/* ========================================================= */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-bloody-panel backdrop-blur-xl border border-gray-200 dark:border-bloody-border rounded-3xl p-5 sm:p-7 shadow-xl shadow-gray-200/60 dark:shadow-2xl dark:shadow-black/90 relative">
            {/* Search Type Tabs */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-bloody-border pb-3 mb-4 text-xs font-bold">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSearchMode('standard')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    searchMode === 'standard'
                      ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                      : 'text-gray-600 dark:text-rose-300/80 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-bloody-card'
                  }`}
                >
                  Structured Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('ai')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 ${
                    searchMode === 'ai'
                      ? 'bg-blood-600 text-white shadow-md shadow-blood-600/30'
                      : 'text-gray-600 dark:text-rose-300/80 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-bloody-card'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
                  <span>Natural Language AI</span>
                </button>
              </div>

              <Link
                href="/map"
                className="text-blood-600 dark:text-rose-400 hover:underline flex items-center space-x-1 transition-colors hidden sm:flex text-xs font-bold"
              >
                <span>Browse Live Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {searchMode === 'standard' ? (
              <form onSubmit={handleStandardSearch} className="space-y-4">
                {/* Blood Group Select Pills */}
                <div>
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-rose-300 mb-2">
                    Select Patient Blood Group:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {BLOOD_GROUPS.map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => setSelectedBloodGroup(bg)}
                        className={`py-2 rounded-xl text-xs sm:text-sm font-black border transition-all ${
                          selectedBloodGroup === bg
                            ? 'bg-blood-600 text-white border-blood-600 shadow-md shadow-blood-600/30 scale-105'
                            : 'bg-white dark:bg-bloody-card text-gray-800 dark:text-rose-200 border-gray-200 dark:border-bloody-border hover:border-blood-300 dark:hover:border-red-800 hover:bg-red-50/50 dark:hover:bg-bloody-cardHover shadow-sm'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* District Selector & Action Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  <div className="sm:col-span-8">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-700 dark:text-rose-300 mb-1">
                      Hospital Location / District:
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-blood-600 dark:text-rose-400 absolute left-3.5 top-3" />
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full text-xs sm:text-sm font-bold pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-bloody-card border border-gray-300 dark:border-bloody-border rounded-xl text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-blood-500 shadow-sm"
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d.id} value={d.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                            {d.name} ({d.bnName}) • {d.divisionId.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg shadow-blood-600/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Find Ready Donors</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAiSearch} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. 'I urgently need O positive blood near Wari Hospital today' or 'জরুরী ও পজিটিভ রক্ত লাগবে ওয়ারী এলাকায়'"
                    className="w-full text-xs sm:text-sm font-medium px-4 py-3 bg-gray-50 dark:bg-bloody-card border border-gray-300 dark:border-bloody-border rounded-xl text-gray-900 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:outline-none focus:ring-2 focus:ring-blood-500"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="sm:absolute sm:right-2 sm:top-2 w-full sm:w-auto mt-2 sm:mt-0 px-4 py-1.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAiLoading ? 'Analyzing Prompt...' : 'Parse & Find'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-rose-300/70">
                  Dual English & Bangla conversational query parsing powered by the BloodLink AI microservice.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* LIVE RADAR SNAPSHOT: 100+ Donors & Interactive Teaser     */}
        {/* ========================================================= */}
        <section className="bg-white dark:bg-bloody-panel border border-gray-200 dark:border-bloody-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-md dark:shadow-xl dark:shadow-blood-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Real-Time Radar
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                Live Donor Distribution Across Bangladesh
              </h2>
              <p className="text-xs text-gray-500 dark:text-rose-300/70">
                Over 100 verified voluntary donors active with exact GPS coordinates and clinical eligibility tags.
              </p>
            </div>

            <Link
              href="/map"
              className="inline-flex items-center space-x-2 bg-blood-600 hover:bg-blood-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-md shadow-blood-600/20"
            >
              <Navigation className="w-4 h-4 text-emerald-200" />
              <span>Open Fullscreen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border p-4 rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{stats.totalDonors}</div>
              <div className="text-[11px] font-bold text-gray-600 dark:text-rose-300/80 uppercase tracking-wider mt-0.5">
                Plotted Donors
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border p-4 rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.availableDonors}</div>
              <div className="text-[11px] font-bold text-gray-600 dark:text-rose-300/80 uppercase tracking-wider mt-0.5">
                Eligible Today
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border p-4 rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{stats.districtsCovered} / 64</div>
              <div className="text-[11px] font-bold text-gray-600 dark:text-rose-300/80 uppercase tracking-wider mt-0.5">
                Districts Covered
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-bloody-card border border-gray-200 dark:border-bloody-border p-4 rounded-2xl shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">{stats.openRequests}</div>
              <div className="text-[11px] font-bold text-gray-600 dark:text-rose-300/80 uppercase tracking-wider mt-0.5">
                Urgent Appeals
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ACTIVE EMERGENCY APPEALS TICKER: Live Urgency             */}
        {/* ========================================================= */}
        {recentRequests.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Emergency Hospital Appeals</h3>
              </div>
              <Link href="/requests/new" className="text-xs text-blood-600 dark:text-rose-400 hover:underline font-bold">
                + Create Appeal
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-2xl p-4 flex flex-col justify-between hover:border-gray-300 dark:hover:border-red-900 transition-colors shadow-sm dark:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-xl bg-blood-600 text-white font-black text-sm flex items-center justify-center shadow">
                        {req.patientBloodGroup}
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 dark:bg-blood-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-bloody-border">
                        {req.emergencyPriority}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{req.hospitalName}</h4>
                      <p className="text-xs text-gray-500 dark:text-rose-300/70">
                        📍 {req.areaName || req.upazila?.name || ''}, {req.district?.name}
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-rose-200/80 italic line-clamp-2">
                      &quot;{req.notes || 'Emergency transfusion required immediately.'}&quot;
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-bloody-border flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 dark:text-rose-300/60 font-medium">{req.unitsNeeded} Bag(s) required</span>
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* 3-STEP MINIMAL WORKFLOW: Clear & Trustworthy               */}
        {/* ========================================================= */}
        <section className="space-y-8 pt-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blood-600 dark:text-rose-400">
              Deterministic Safety Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">How BloodBond Works</h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-rose-300/70">
              Built for high-stress medical environments with zero external dependencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-3xl p-6 space-y-3 relative overflow-hidden shadow-sm dark:shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-blood-50 dark:bg-blood-950/80 border border-blood-200 dark:border-bloody-border text-blood-700 dark:text-rose-300 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Biological Eligibility Filter</h3>
              <p className="text-xs text-gray-600 dark:text-rose-200/80 leading-relaxed">
                Stage 1 deterministically enforces Red Blood Cell (RBC) compatibility (e.g. O- universal, AB+ recipient) and blocks any candidate within the 90-day cooldown interval.
              </p>
            </div>

            <div className="bg-white dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-3xl p-6 space-y-3 relative overflow-hidden shadow-sm dark:shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-blood-50 dark:bg-blood-950/80 border border-blood-200 dark:border-bloody-border text-blood-700 dark:text-rose-300 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Geographic Proximity Engine</h3>
              <p className="text-xs text-gray-600 dark:text-rose-200/80 leading-relaxed">
                Stage 2 ranks verified candidates starting from the exact hospital neighborhood, expanding outward via Haversine distance through Thana, District, and Division.
              </p>
            </div>

            <div className="bg-white dark:bg-bloody-card border border-gray-200 dark:border-bloody-border rounded-3xl p-6 space-y-3 relative overflow-hidden shadow-sm dark:shadow-md">
              <div className="w-10 h-10 rounded-2xl bg-blood-50 dark:bg-blood-950/80 border border-blood-200 dark:border-bloody-border text-blood-700 dark:text-rose-300 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Immediate Direct Action</h3>
              <p className="text-xs text-gray-600 dark:text-rose-200/80 leading-relaxed">
                Connect via direct telephone, SMS alert, or dispatch in-app notifications. Contact details are protected by privacy masks until explicit emergency coordination.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* BANGLADESH FOOTER BANNER: Humanitarian Invitation         */}
        {/* ========================================================= */}
        <section className="bg-gradient-to-r from-red-50 via-white to-red-50 dark:from-bloody-panel dark:via-blood-950/50 dark:to-bloody-base border border-red-200 dark:border-bloody-border rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm dark:shadow-xl">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              Ready to Save a Life in Your Neighborhood?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-rose-200/80">
              Join thousands of voluntary blood donors across Bangladesh. Set your live GPS pin and receive alerts only when a patient truly needs your blood type.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/register/donor"
              className="px-6 py-3 bg-blood-600 hover:bg-blood-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-blood-600/30 transition-all hover:scale-105"
            >
              Register as Voluntary Donor
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white dark:bg-bloody-card hover:bg-gray-100 dark:hover:bg-bloody-cardHover text-gray-800 dark:text-rose-200 border border-gray-300 dark:border-bloody-border rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm"
            >
              View General Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
