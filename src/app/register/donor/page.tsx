'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, User, Phone, Mail, Lock, MapPin, Calendar, CheckSquare, ShieldCheck } from 'lucide-react';
import { DIVISIONS, DISTRICTS, UPAZILAS } from '@/data/bangladesh-geo';
import { BLOOD_GROUPS } from '@/lib/blood-compatibility';

export default function DonorRegistrationPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [divisionId, setDivisionId] = useState('dhaka');
  const [districtId, setDistrictId] = useState('dhaka');
  const [upazilaId, setUpazilaId] = useState('wari');
  const [areaName, setAreaName] = useState('Wari');
  const [addressDetails, setAddressDetails] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('AVAILABLE');
  const [preferredContactMethod, setPreferredContactMethod] = useState('PHONE');
  const [consentGiven, setConsentGiven] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const availableUpazilas = UPAZILAS.filter((u) => u.districtId === districtId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consentGiven) {
      setError('You must consent to data processing and emergency contact.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'DONOR',
          fullName,
          phone,
          email: email || undefined,
          password,
          bloodGroup,
          dateOfBirth: dateOfBirth || undefined,
          gender,
          divisionId,
          districtId,
          upazilaId,
          areaName,
          addressDetails,
          lastDonationDate: lastDonationDate || undefined,
          availabilityStatus,
          preferredContactMethod,
          consentGiven,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/donor/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Connection failure during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl shadow-gray-200/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blood-500/20">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Register as a Blood Donor
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Join the nationwide network of voluntary donors across all 64 districts. Your contact details remain protected until an emergency arises.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Mobile Number (BD format) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712345678"
                className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tanvir@example.com"
                className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Account Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          {/* Blood Group & Vitals */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-2">
              Your Blood Group *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-2 rounded-xl text-xs font-black border transition-all ${
                    bloodGroup === bg
                      ? 'bg-blood-600 text-white border-blood-600 shadow-md shadow-blood-500/20'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Geographic Location Hierarchy */}
          <div className="pt-2 border-t border-gray-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
              Bangladesh Location Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
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
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                >
                  {DIVISIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.bnName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
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
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                >
                  {DISTRICTS.filter((d) => d.divisionId === divisionId).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.bnName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Upazila / Thana *
                </label>
                <select
                  value={upazilaId}
                  onChange={(e) => setUpazilaId(e.target.value)}
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                >
                  {availableUpazilas.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.bnName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Area / Neighborhood *
                </label>
                <input
                  type="text"
                  required
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Wari, Rankin Street, Tikatuli"
                  className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Optional Address Landmark
                </label>
                <input
                  type="text"
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="e.g. Near Baldha Garden"
                  className="w-full text-sm font-medium p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Donation History & Eligibility Cooldown */}
          <div className="pt-2 border-t border-gray-100 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
              Donation History & Availability
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Last Blood Donation Date (If Any)
                </label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                />
                <span className="text-[10px] text-gray-400">
                  Leave blank if you have not donated blood in the last 90 days.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Current Availability
                </label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full text-sm font-semibold rounded-xl border border-gray-300 p-2.5 bg-gray-50 focus:bg-white"
                >
                  <option value="AVAILABLE">Available for Emergencies</option>
                  <option value="UNAVAILABLE">Unavailable Right Now</option>
                  <option value="TEMPORARILY_BUSY">Temporarily Busy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-blood-600 focus:ring-blood-500 border-gray-300"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I voluntarily consent to registration as a blood donor on BloodBond Bangladesh. I agree to receive emergency donor alerts from verified seekers and hospitals. I understand that clinical screening will take place before transfusion.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blood-600 hover:bg-blood-700 text-white font-black rounded-xl shadow-lg shadow-blood-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>{isLoading ? 'Creating Profile...' : 'Complete Donor Registration'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 pt-2">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-blood-600 hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
