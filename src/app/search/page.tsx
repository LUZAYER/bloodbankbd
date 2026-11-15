'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  Clock,
  Sparkles,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Share2,
  Heart,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { DIVISIONS, DISTRICTS, UPAZILAS } from '@/data/bangladesh-geo';
import { BLOOD_GROUPS } from '@/lib/blood-compatibility';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search Parameters
  const [bloodGroup, setBloodGroup] = useState(searchParams.get('bloodGroup') || 'O+');
  const [divisionId, setDivisionId] = useState(searchParams.get('divisionId') || 'dhaka');
  const [districtId, setDistrictId] = useState(searchParams.get('districtId') || 'dhaka');
  const [upazilaId, setUpazilaId] = useState(searchParams.get('upazilaId') || 'wari');
  const [areaName, setAreaName] = useState(searchParams.get('areaName') || 'Wari');
  const [urgency, setUrgency] = useState(searchParams.get('urgency') || 'URGENT');

  // AI query state
  const [aiText, setAiText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);

  // Results State
  const [isLoading, setIsLoading] = useState(false);
  const [resultsData, setResultsData] = useState<any>(null);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState<any>(null);
  const [contactSuccessMessage, setContactSuccessMessage] = useState<string | null>(null);

  // Available upazilas for selected district
  const availableUpazilas = UPAZILAS.filter((u) => u.districtId === districtId);

  useEffect(() => {
    executeSearch();
  }, []);

  const executeSearch = async (overrideParams?: any) => {
    setIsLoading(true);
    setContactSuccessMessage(null);
    try {
      const payload = {
        bloodGroup: overrideParams?.bloodGroup || bloodGroup,
        divisionId: overrideParams?.divisionId || divisionId,
        districtId: overrideParams?.districtId || districtId,
        upazilaId: overrideParams?.upazilaId || upazilaId,
        areaName: overrideParams?.areaName !== undefined ? overrideParams.areaName : areaName,
        emergencyPriority: urgency,
      };

      const res = await fetch('/api/matching/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setResultsData(data.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiText.trim()) return;

    setIsAiParsing(true);
    try {
      const res = await fetch('/api/ai/parse-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiText }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        if (p.bloodGroup) setBloodGroup(p.bloodGroup);
        if (p.divisionId) setDivisionId(p.divisionId);
        if (p.districtId) setDistrictId(p.districtId);
        if (p.upazilaId) setUpazilaId(p.upazilaId);
        if (p.areaName) setAreaName(p.areaName);
        if (p.urgency) setUrgency(p.urgency);

        executeSearch({
          bloodGroup: p.bloodGroup || bloodGroup,
          divisionId: p.divisionId || divisionId,
          districtId: p.districtId || districtId,
          upazilaId: p.upazilaId || upazilaId,
          areaName: p.areaName || areaName,
        });
      }
    } catch (err) {
      console.error('AI parse error:', err);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleContactDonor = (match: any) => {
    setSelectedDonorForContact(match);
  };

  const handleSendDirectAlert = async () => {
    if (!selectedDonorForContact) return;
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientBloodGroup: bloodGroup,
          unitsNeeded: 1,
          hospitalName: 'Emergency Location (' + (areaName || 'Nearby Hospital') + ')',
          divisionId,
          districtId,
          upazilaId,
          areaName,
          contactPhone: '01811111111',
          emergencyPriority: 'CRITICAL',
          notes: `Direct emergency inquiry sent to ${selectedDonorForContact.donor.fullName}.`,
        }),
      });

      if (res.ok) {
        setContactSuccessMessage(`Emergency alert dispatched to ${selectedDonorForContact.donor.fullName} via SMS & In-App notification!`);
        setTimeout(() => setSelectedDonorForContact(null), 2500);
      } else {
        const err = await res.json();
        alert(err.error || 'Please sign in to contact donors directly.');
      }
    } catch {
      alert('Could not dispatch alert. Please check your connection.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blood-600 dark:text-rose-400">
          <Search className="w-3.5 h-3.5" />
          <span>Real-Time Geographic Matcher</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1">
          Emergency Blood Donor Discovery
        </h1>
        <p className="text-sm text-gray-600 dark:text-rose-200/80 mt-1">
          Prioritizes eligible, available donors closest to your patient's hospital.
        </p>
      </div>

      {/* AI Assistant Bar */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-bloody-panel dark:to-blood-950/70 border border-blood-200 dark:border-bloody-border p-4 rounded-2xl shadow-sm">
        <form onSubmit={handleAiParse} className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="flex items-center space-x-2 text-blood-700 dark:text-rose-300 pl-1">
            <Sparkles className="w-5 h-5 text-blood-600 dark:text-rose-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
              Natural Language:
            </span>
          </div>
          <input
            type="text"
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            placeholder="e.g. 'I need O positive blood in Wari Dhaka today' or 'জরুরী ও পজিটিভ ওয়ারী'"
            className="flex-1 w-full text-sm font-medium px-4 py-2.5 rounded-xl border border-blood-200 dark:border-bloody-border bg-white dark:bg-bloody-card text-gray-900 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:outline-none focus:ring-2 focus:ring-blood-500"
          />
          <button
            type="submit"
            disabled={isAiParsing}
            className="w-full sm:w-auto px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-sm transition-colors"
          >
            {isAiParsing ? 'Analyzing...' : 'Parse & Search'}
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Results Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-bloody-panel rounded-2xl border border-gray-200 dark:border-bloody-border p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-bloody-border pb-3">
              <span className="font-extrabold text-gray-900 dark:text-white flex items-center space-x-2 text-sm">
                <Filter className="w-4 h-4 text-blood-600 dark:text-rose-400" />
                <span>Geographic Search Criteria</span>
              </span>
              <button
                onClick={() => {
                  setAreaName('');
                  executeSearch({ areaName: '' });
                }}
                className="text-xs text-blood-600 dark:text-rose-400 font-semibold hover:underline"
              >
                Clear Area
              </button>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-2">
                Patient Blood Group *
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => {
                      setBloodGroup(bg);
                      executeSearch({ bloodGroup: bg });
                    }}
                    className={`py-2 rounded-xl text-xs font-black border transition-all ${
                      bloodGroup === bg
                        ? 'bg-blood-600 text-white border-blood-600 shadow-sm'
                        : 'bg-gray-50 dark:bg-bloody-card text-gray-700 dark:text-rose-200 border-gray-200 dark:border-bloody-border hover:bg-gray-100 dark:hover:bg-bloody-cardHover'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Division */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Division
              </label>
              <select
                value={divisionId}
                onChange={(e) => {
                  const newDiv = e.target.value;
                  setDivisionId(newDiv);
                  const firstDist = DISTRICTS.find((d) => d.divisionId === newDiv);
                  if (firstDist) {
                    setDistrictId(firstDist.id);
                    const firstUpz = UPAZILAS.find((u) => u.districtId === firstDist.id);
                    if (firstUpz) setUpazilaId(firstUpz.id);
                  }
                  executeSearch({ divisionId: newDiv, districtId: firstDist?.id });
                }}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-blood-500"
              >
                {DIVISIONS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                    {d.name} ({d.bnName})
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                District
              </label>
              <select
                value={districtId}
                onChange={(e) => {
                  const newDist = e.target.value;
                  setDistrictId(newDist);
                  const firstUpz = UPAZILAS.find((u) => u.districtId === newDist);
                  if (firstUpz) setUpazilaId(firstUpz.id);
                  executeSearch({ districtId: newDist, upazilaId: firstUpz?.id });
                }}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-blood-500"
              >
                {DISTRICTS.filter((d) => d.divisionId === divisionId).map((d) => (
                  <option key={d.id} value={d.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                    {d.name} ({d.bnName})
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila / Thana */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Upazila / Thana
              </label>
              <select
                value={upazilaId}
                onChange={(e) => {
                  setUpazilaId(e.target.value);
                  executeSearch({ upazilaId: e.target.value });
                }}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-blood-500"
              >
                <option value="" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">All Upazilas in District</option>
                {availableUpazilas.map((u) => (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                    {u.name} ({u.bnName})
                  </option>
                ))}
              </select>
            </div>

            {/* Neighborhood / Area Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Specific Area / Neighborhood
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Wari, Rankin Street, Tikatuli"
                  className="w-full text-sm font-medium rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:outline-none focus:ring-2 focus:ring-blood-500"
                />
                <button
                  type="button"
                  onClick={() => executeSearch()}
                  className="px-4 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Emergency Priority */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Emergency Priority
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100"
              >
                <option value="CRITICAL" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">Critical (Immediate 1-2 hours)</option>
                <option value="URGENT" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">Urgent (Within 6 hours)</option>
                <option value="STANDARD" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">Standard (Scheduled)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => executeSearch()}
              className="w-full py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Refresh Results</span>
            </button>

            <Link
              href={`/map?bloodGroup=${bloodGroup}&divisionId=${divisionId}&districtId=${districtId}`}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 text-xs"
            >
              <MapPin className="w-4 h-4 text-emerald-200" />
              <span>View On Live Bangladesh Map</span>
            </Link>
          </div>

          {/* Quick Help Card */}
          <div className="bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-amber-950 dark:text-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Cannot find enough local donors?</span>
            </div>
            <p className="leading-relaxed">
              If an immediate neighborhood donor is unavailable, create an open emergency request. It dispatches instant notifications across progressive geographic tiers in {districtId}.
            </p>
            <Link
              href="/requests/new"
              className="inline-block font-extrabold text-blood-700 dark:text-rose-400 hover:underline pt-1"
            >
              Post Emergency Request Now →
            </Link>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Results Summary Bar */}
          <div className="bg-white dark:bg-bloody-panel rounded-2xl border border-gray-200 dark:border-bloody-border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase font-bold text-gray-500 dark:text-rose-300/70">
                Search Criteria: {bloodGroup} Blood • {areaName || upazilaId || districtId}
              </p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xl font-black text-gray-900 dark:text-white">
                  {resultsData ? resultsData.totalFound : 0} Eligible Donor(s) Found
                </span>
                {resultsData?.fallbackSuggested && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-full">
                    Expanded to District
                  </span>
                )}
              </div>
            </div>

            {resultsData?.tierCounts && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 bg-red-50 dark:bg-blood-950 text-blood-700 dark:text-rose-300 font-bold rounded-lg border border-red-200 dark:border-bloody-border">
                  Exact Area: {resultsData.tierCounts.exactArea}
                </span>
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-bloody-card text-gray-700 dark:text-rose-200 font-bold rounded-lg border border-gray-200 dark:border-bloody-border">
                  Nearby / District: {resultsData.tierCounts.sameDistrict + resultsData.tierCounts.sameThana}
                </span>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="bg-white dark:bg-bloody-panel rounded-2xl border border-gray-200 dark:border-bloody-border p-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-blood-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-gray-600 dark:text-rose-300/80">
                Evaluating biological compatibility and geographic proximity...
              </p>
            </div>
          )}

          {/* Fallback Notice if No Donors in exact area */}
          {!isLoading && resultsData?.tierCounts?.exactArea === 0 && resultsData?.totalFound > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-amber-950 dark:text-amber-100">
                  No exact-area {bloodGroup} donors found directly in &quot;{areaName}&quot;.
                </p>
                <p className="mt-0.5 leading-relaxed text-amber-900 dark:text-amber-200">
                  Showing eligible donors from nearby neighborhoods and the wider {districtId} district ranked by proximity.
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && resultsData && resultsData.totalFound === 0 && (
            <div className="bg-white dark:bg-bloody-panel rounded-2xl border border-gray-200 dark:border-bloody-border p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 dark:bg-blood-950 text-blood-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  No eligible {bloodGroup} donors found for selected filters
                </h3>
                <p className="text-xs text-gray-500 dark:text-rose-300/70 max-w-md mx-auto mt-1">
                  Donors may be currently unavailable or in their 90-day medical safety cooldown period.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setAreaName('');
                    setUpazilaId('');
                    executeSearch({ areaName: '', upazilaId: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-bloody-card hover:bg-gray-200 dark:hover:bg-bloody-cardHover text-gray-800 dark:text-rose-200 text-xs font-bold rounded-xl border dark:border-bloody-border"
                >
                  Expand to Entire {districtId} District
                </button>
                <Link
                  href="/requests/new"
                  className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl"
                >
                  Broadcast Emergency Request
                </Link>
              </div>
            </div>
          )}

          {/* Donor Match Results Cards */}
          {!isLoading && resultsData && resultsData.matches && (
            <div className="space-y-4">
              {resultsData.matches.map((match: any) => {
                const donor = match.donor;
                return (
                  <div
                    key={donor.id}
                    className={`bg-white dark:bg-bloody-card rounded-2xl border p-5 transition-all shadow-sm hover:shadow-md ${
                      match.tier === 'EXACT_AREA'
                        ? 'border-blood-300 dark:border-red-800 ring-1 ring-blood-200 dark:ring-red-950'
                        : 'border-gray-200 dark:border-bloody-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Donor Blood Group & Info */}
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-blood-600 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-md shadow-blood-500/20">
                          <span className="text-lg font-black">{donor.bloodGroup}</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">
                            Donor
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                              {donor.fullName}
                            </h3>
                            {donor.verificationStatus === 'VERIFIED' && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Verified Donor</span>
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                match.tier === 'EXACT_AREA'
                                  ? 'bg-blood-100 dark:bg-blood-950 text-blood-800 dark:text-rose-300'
                                  : 'bg-gray-100 dark:bg-bloody-card text-gray-700 dark:text-rose-300 border dark:border-bloody-border'
                              }`}
                            >
                              {match.matchTierLabel}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-rose-200/80">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-rose-400" />
                              <strong className="text-gray-900 dark:text-white">{donor.areaName}</strong>
                              <span>({donor.upazilaName || donor.upazilaId}, {donor.districtName || donor.districtId})</span>
                            </span>
                            {match.distanceKm !== undefined && (
                              <span className="font-semibold text-blood-700 dark:text-rose-400">
                                ~{match.distanceKm} km away
                              </span>
                            )}
                          </div>

                          {/* Match explanation & biological note */}
                          <div className="pt-1 text-xs text-gray-500">
                            <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              ✓ {match.overallExplanation}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 dark:border-bloody-border pt-3 sm:pt-0">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-rose-300/60">
                            Match Score
                          </span>
                          <p className="text-base font-black text-blood-700 dark:text-rose-400">
                            {match.rankingScore} pts
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleContactDonor(match)}
                          className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contact / Alert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Protected Contact / Direct Alert Modal */}
      {selectedDonorForContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-bloody-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-bloody-border space-y-4">
            <div className="flex items-center justify-between border-b dark:border-bloody-border pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blood-100 dark:bg-blood-950 text-blood-700 dark:text-rose-300 font-extrabold flex items-center justify-center text-sm">
                  {selectedDonorForContact.donor.bloodGroup}
                </div>
                <h3 className="font-extrabold text-gray-900 dark:text-white">
                  Contact {selectedDonorForContact.donor.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDonorForContact(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {contactSuccessMessage ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm font-semibold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p>{contactSuccessMessage}</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-gray-600 dark:text-rose-200/80">
                <div className="bg-slate-50 dark:bg-bloody-card p-3.5 rounded-xl space-y-1.5 border border-slate-200 dark:border-bloody-border">
                  <p>
                    <strong className="text-gray-900 dark:text-white">Location:</strong> {selectedDonorForContact.donor.areaName}, {selectedDonorForContact.donor.upazilaName || selectedDonorForContact.donor.upazilaId}
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">Phone:</strong> {selectedDonorForContact.donor.phone}
                  </p>
                  <p>
                    <strong className="text-gray-900 dark:text-white">Response Rate:</strong> {Math.round((selectedDonorForContact.donor.responseRate || 1.0) * 100)}%
                  </p>
                </div>

                <div className="p-3 bg-red-50 dark:bg-blood-950/70 border border-red-200 dark:border-bloody-border rounded-xl text-blood-900 dark:text-rose-200 leading-relaxed">
                  <p className="font-bold mb-1 text-blood-950 dark:text-white">Emergency Protocol:</p>
                  <p>
                    Dispatching this alert sends an immediate SMS and in-app emergency alert to the donor. Please ensure a medical emergency request has been validated by your hospital.
                  </p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setSelectedDonorForContact(null)}
                    className="flex-1 py-2.5 bg-gray-100 dark:bg-bloody-card hover:bg-gray-200 dark:hover:bg-bloody-cardHover text-gray-800 dark:text-rose-200 font-bold rounded-xl border dark:border-bloody-border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendDirectAlert}
                    className="flex-1 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Send Emergency Alert</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-gray-500">Loading search engine...</div>}>
      <SearchContent />
    </Suspense>
  );
}
