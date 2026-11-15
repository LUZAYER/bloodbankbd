'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  Hospital,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  Share2,
} from 'lucide-react';

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [requestData, setRequestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      const res = await fetch(`/api/requests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequestData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchRequestDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-gray-500 font-semibold">
        Loading emergency request details...
      </div>
    );
  }

  if (!requestData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Request Not Found</h2>
        <Link href="/search" className="text-sm text-blood-600 font-bold hover:underline">
          Return to Search Donors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/seeker/dashboard"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-blood-600"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blood-600 text-white flex flex-col items-center justify-center font-black flex-shrink-0 shadow-lg shadow-blood-500/20">
              <span className="text-2xl">{requestData.patientBloodGroup}</span>
              <span className="text-[9px] uppercase font-semibold">Needed</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900">
                  {requestData.hospitalName}
                </h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    requestData.status === 'OPEN'
                      ? 'bg-blue-100 text-blue-800'
                      : requestData.status === 'MATCHED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : requestData.status === 'FULFILLED'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Status: {requestData.status}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full">
                  {requestData.emergencyPriority}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {requestData.areaName}, {requestData.upazila?.name || requestData.upazilaId},{' '}
                  {requestData.district?.name || requestData.districtId}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/search?bloodGroup=${encodeURIComponent(requestData.patientBloodGroup)}&districtId=${requestData.districtId}&areaName=${encodeURIComponent(requestData.areaName)}`}
              className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Search Compatible Donors
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-gray-700">
          <div>
            <span className="text-gray-400 font-bold uppercase block text-[10px]">
              Units Requested
            </span>
            <span className="text-sm font-extrabold text-gray-900">
              {requestData.unitsNeeded} Bag(s)
            </span>
          </div>

          <div>
            <span className="text-gray-400 font-bold uppercase block text-[10px]">
              Attendant Phone
            </span>
            <span className="text-sm font-extrabold text-gray-900">
              {requestData.contactPhone}
            </span>
          </div>

          <div>
            <span className="text-gray-400 font-bold uppercase block text-[10px]">
              Created At
            </span>
            <span className="text-sm font-extrabold text-gray-900">
              {new Date(requestData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {requestData.notes && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1">
            <span className="font-bold uppercase text-[10px] text-gray-400">
              Medical & Condition Notes:
            </span>
            <p className="text-gray-800">{requestData.notes}</p>
          </div>
        )}

        {/* Donor Responses Feed */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-extrabold text-base text-gray-900">
            Donor Responses ({requestData.requestResponses?.length || 0})
          </h3>

          {(!requestData.requestResponses || requestData.requestResponses.length === 0) ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl">
              No donors have directly responded to this request yet. Nearby compatible donors were notified.
            </div>
          ) : (
            <div className="space-y-3">
              {requestData.requestResponses.map((resp: any) => (
                <div
                  key={resp.id}
                  className="p-4 bg-white rounded-2xl border border-gray-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blood-100 text-blood-700 font-black flex items-center justify-center text-xs">
                      {resp.donorProfile?.bloodGroup}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">
                        {resp.donorProfile?.fullName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Phone: {resp.donorProfile?.phone || resp.donorProfile?.user?.phone}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      resp.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {resp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seeker Management Controls */}
        <div className="pt-4 border-t flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Emergency status updates:
          </span>
          <div className="flex space-x-2">
            {requestData.status !== 'FULFILLED' && (
              <button
                onClick={() => handleUpdateStatus('FULFILLED')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                Mark as Fulfilled
              </button>
            )}
            {requestData.status !== 'CANCELLED' && (
              <button
                onClick={() => handleUpdateStatus('CANCELLED')}
                className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-red-600 font-bold rounded-xl text-xs"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
