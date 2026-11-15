import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-black text-gray-900">Privacy Policy & Donor Data Rights</h1>
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <h2 className="text-lg font-bold text-gray-900">1. Data Minimization & Security</h2>
        <p>
          BloodBond Bangladesh strictly collects only the data necessary for emergency matching: name, contact number, blood group, general geographic location, and last donation date. We do not store or sell unnecessary medical histories.
        </p>
        <h2 className="text-lg font-bold text-gray-900">2. Protected Phone Numbers</h2>
        <p>
          Anonymous web visitors cannot view your full phone number. Numbers are masked (e.g. 01711***111) unless an authenticated blood request alert is triggered.
        </p>
        <h2 className="text-lg font-bold text-gray-900">3. Consent & Right to Delete</h2>
        <p>
          Donors can mark themselves 'Unavailable' or request complete account deletion at any time from their dashboard or by contacting administration.
        </p>
      </div>
    </div>
  );
}
