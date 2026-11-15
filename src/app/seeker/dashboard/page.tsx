'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Clock, MapPin, CheckCircle2, XCircle, Search, AlertTriangle, Users } from 'lucide-react';

export default function SeekerDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSeekerRequests();
  }, []);

  const fetchSeekerRequests = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      if (!meData.success || meData.user?.role !== 'SEEKER') {
        // If donor accidentally visited, redirect to donor dashboard
        if (meData.user?.role === 'DONOR') {
          router.push('/donor/dashboard');
          return;
        }
      }

      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchSeekerRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-gray-500 font-semibold">
        Loading blood requests...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Emergency Coordination
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-1">
            Blood Seeker Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track active emergency transfusion requests and manage donor responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/map"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <MapPin className="w-3.5 h-3.5" />
            <span>Live Radar Map</span>
          </Link>
          <Link
            href="/search"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Donors</span>
          </Link>
          <Link
            href="/requests/new"
            className="px-4 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post New Request</span>
          </Link>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900">
          Emergency Blood Requests ({requests.length})
        </h3>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              You haven't posted any emergency blood requests yet.
            </p>
            <Link
              href="/requests/new"
              className="inline-block px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Post Emergency Request Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-blood-600 text-white flex flex-col items-center justify-center font-black flex-shrink-0 shadow-md">
                    <span className="text-lg">{req.patientBloodGroup}</span>
                    <span className="text-[8px] uppercase">{req.unitsNeeded} Bag(s)</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-extrabold text-gray-900">
                        {req.hospitalName}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === 'OPEN'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'MATCHED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'FULFILLED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Status: {req.status}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                        {req.emergencyPriority}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Location: {req.areaName}, {req.upazila?.name || req.upazilaId},{' '}
                      {req.district?.name || req.districtId} • Contact: {req.contactPhone}
                    </p>

                    {req.notes && (
                      <p className="text-xs text-gray-600 italic">"{req.notes}"</p>
                    )}

                    {/* Donor Responses count */}
                    {req.requestResponses && req.requestResponses.length > 0 && (
                      <div className="pt-2 text-xs font-bold text-emerald-700">
                        ✓ {req.requestResponses.length} donor(s) responded to this request.
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  <Link
                    href={`/map?bloodGroup=${encodeURIComponent(req.patientBloodGroup)}&districtId=${req.districtId}`}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs border border-emerald-200 flex items-center space-x-1"
                    title="See donors near this hospital on Live Map"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Map</span>
                  </Link>

                  <Link
                    href={`/requests/${req.id}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs"
                  >
                    View Details & Donors
                  </Link>

                  {req.status === 'OPEN' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'FULFILLED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                    >
                      Mark Fulfilled
                    </button>
                  )}

                  {req.status !== 'CANCELLED' && req.status !== 'FULFILLED' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'CANCELLED')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-red-600 font-bold rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
