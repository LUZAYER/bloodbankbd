'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Calendar, PlusCircle, CheckCircle2, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function DonationHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [profileMeta, setProfileMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [donationDate, setDonationDate] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [units, setUnits] = useState('1');
  const [componentType, setComponentType] = useState('WHOLE_BLOOD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/donor/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.data || []);
        setProfileMeta(data.profile);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/donor/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationDate,
          hospitalName,
          units,
          componentType,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Donation record logged and safety eligibility updated!');
        setDonationDate('');
        setHospitalName('');
        setNotes('');
        fetchHistory();
      } else {
        alert(data.error || 'Failed to record donation.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blood-600">
          <Calendar className="w-3.5 h-3.5" />
          <span>Verified Medical Records</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mt-1">
          My Blood Donation History
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Keep track of your life-saving contributions and calculate your safety cooldown.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-400">
            Total Donations Recorded
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {profileMeta?.totalDonationsCount || history.length} Times
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-gray-400">
            Last Donation Date
          </span>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {profileMeta?.lastDonationDate
              ? new Date(profileMeta.lastDonationDate).toISOString().split('T')[0]
              : 'None recorded'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-blood-600">
            Estimated Next Eligibility
          </span>
          <p className="text-2xl font-black text-blood-700 mt-1">
            {profileMeta?.nextEligibleDate
              ? new Date(profileMeta.nextEligibleDate).toISOString().split('T')[0]
              : 'Eligible Now'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form: Log New Record */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
            <PlusCircle className="w-4 h-4 text-blood-600" />
            <span>Record a New Donation</span>
          </h3>

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
              {message}
            </div>
          )}

          <form onSubmit={handleAddDonation} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Donation Date *
              </label>
              <input
                type="date"
                required
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Hospital or Facility Name *
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Wari General Hospital or Red Crescent"
                className="w-full text-sm font-medium rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Units (Bags)
                </label>
                <input
                  type="number"
                  min="1"
                  max="2"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Component
                </label>
                <select
                  value={componentType}
                  onChange={(e) => setComponentType(e.target.value)}
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                >
                  <option value="WHOLE_BLOOD">Whole Blood</option>
                  <option value="RBC">Red Blood Cells</option>
                  <option value="PLATELETS">Platelets</option>
                  <option value="PLASMA">Plasma</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Notes or Recipient Patient Details
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Emergency surgery replacement donation"
                className="w-full text-sm font-medium rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              {isSubmitting ? 'Logging...' : 'Save Donation & Recalculate'}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-extrabold text-base text-gray-900">
            Recorded Donations ({history.length})
          </h3>

          {history.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center text-xs text-gray-500">
              No previous donations recorded yet. When you donate at a clinic or hospital, record it here to keep your safety countdown accurate.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-gray-900">{record.hospitalName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                        {record.componentType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Date: {new Date(record.donationDate).toISOString().split('T')[0]} • Units: {record.units} bag(s)
                    </p>
                    {record.notes && (
                      <p className="text-xs text-gray-600 italic">"{record.notes}"</p>
                    )}
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    Logged
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
