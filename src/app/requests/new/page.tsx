'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, PlusCircle, MapPin, Phone, Hospital, Calendar, Heart } from 'lucide-react';
import { DIVISIONS, DISTRICTS, UPAZILAS } from '@/data/bangladesh-geo';
import { BLOOD_GROUPS } from '@/lib/blood-compatibility';

export default function NewBloodRequestPage() {
  const router = useRouter();

  const [patientBloodGroup, setPatientBloodGroup] = useState('O+');
  const [unitsNeeded, setUnitsNeeded] = useState('2');
  const [hospitalName, setHospitalName] = useState('');
  const [divisionId, setDivisionId] = useState('dhaka');
  const [districtId, setDistrictId] = useState('dhaka');
  const [upazilaId, setUpazilaId] = useState('wari');
  const [areaName, setAreaName] = useState('Wari');
  const [contactPhone, setContactPhone] = useState('01811111111');
  const [emergencyPriority, setEmergencyPriority] = useState('CRITICAL');
  const [preferredContact, setPreferredContact] = useState('PHONE');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableUpazilas = UPAZILAS.filter((u) => u.districtId === districtId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientBloodGroup,
          unitsNeeded: parseInt(unitsNeeded, 10),
          hospitalName,
          divisionId,
          districtId,
          upazilaId,
          areaName,
          contactPhone,
          emergencyPriority,
          preferredContact,
          notes,
          requiredDate: new Date(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(`/requests/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to submit request.');
      }
    } catch {
      setError('Connection failure.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white dark:bg-bloody-panel rounded-3xl border border-gray-200 dark:border-bloody-border p-8 shadow-xl shadow-gray-200/50 dark:shadow-2xl dark:shadow-black/80 space-y-6 text-gray-900 dark:text-rose-100 transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-red-100 dark:bg-blood-950 text-blood-700 dark:text-rose-300 text-xs font-bold rounded-full border dark:border-bloody-border">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Request Broadcast</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Create Emergency Blood Request
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300/70">
            Submitting this request alerts compatible, eligible donors in your hospital's immediate vicinity across {districtId}.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-blood-950/80 border border-red-200 dark:border-bloody-border rounded-xl text-xs font-semibold text-red-700 dark:text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Blood Group */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-2">
              Patient Blood Group Needed *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setPatientBloodGroup(bg)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    patientBloodGroup === bg
                      ? 'bg-blood-600 text-white border-blood-600 shadow-md'
                      : 'bg-gray-50 dark:bg-bloody-card text-gray-700 dark:text-rose-200 border-gray-200 dark:border-bloody-border hover:bg-gray-100 dark:hover:bg-bloody-cardHover'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Units Needed (Bags) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(e.target.value)}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-bloody-border bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 focus:bg-white dark:focus:bg-bloody-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Emergency Priority *
              </label>
              <select
                value={emergencyPriority}
                onChange={(e) => setEmergencyPriority(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100"
              >
                <option value="CRITICAL" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">Critical (Immediate 1-2 hours)</option>
                <option value="URGENT" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">Urgent (Within 6 hours)</option>
                <option value="STANDARD" className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">Standard (Scheduled surgery)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
              Hospital / Collection Facility *
            </label>
            <div className="relative">
              <Hospital className="w-4 h-4 text-gray-400 dark:text-rose-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. Dhaka Medical College Hospital / Wari Central Clinic"
                className="w-full text-sm font-medium pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-bloody-border bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:bg-white dark:focus:bg-bloody-panel focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          {/* Location Cascading */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Division *
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
                }}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100"
              >
                {DIVISIONS.map((d) => (
                  <option key={d.id} value={d.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                District *
              </label>
              <select
                value={districtId}
                onChange={(e) => {
                  const newDist = e.target.value;
                  setDistrictId(newDist);
                  const firstUpz = UPAZILAS.find((u) => u.districtId === newDist);
                  if (firstUpz) setUpazilaId(firstUpz.id);
                }}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100"
              >
                {DISTRICTS.filter((d) => d.divisionId === divisionId).map((d) => (
                  <option key={d.id} value={d.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Upazila / Thana *
              </label>
              <select
                value={upazilaId}
                onChange={(e) => setUpazilaId(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100"
              >
                {availableUpazilas.map((u) => (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-bloody-panel text-gray-900 dark:text-rose-100">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Hospital Area / Neighborhood *
              </label>
              <input
                type="text"
                required
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Wari, Rankin Street"
                className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 dark:border-bloody-border bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 focus:bg-white dark:focus:bg-bloody-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
                Attendant Emergency Phone *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="01812345678"
                className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 dark:border-bloody-border bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 focus:bg-white dark:focus:bg-bloody-panel"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
              Case Notes / Patient Condition Details
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Emergency bypass surgery at DMCH. Crossmatching required at hospital blood bank."
              className="w-full text-sm font-medium rounded-xl border border-gray-300 dark:border-bloody-border p-2.5 bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 focus:bg-white dark:focus:bg-bloody-panel"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blood-600 hover:bg-blood-700 text-white font-extrabold rounded-xl shadow-lg shadow-blood-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Broadcasting...' : 'Broadcast Emergency Blood Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
