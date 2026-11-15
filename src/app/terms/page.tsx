import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-black text-gray-900">Terms of Service & Clinical Disclaimer</h1>
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <h2 className="text-lg font-bold text-gray-900">1. Voluntary Platform</h2>
        <p>
          BloodBond Bangladesh is an emergency communication and discovery bridge connecting voluntary blood donors with patients in need. Donors are not employees, agents, or contractors of BloodBond.
        </p>
        <h2 className="text-lg font-bold text-gray-900">2. Mandatory Clinical Screening</h2>
        <p>
          Hospital medical staff and blood bank technicians must perform clinical crossmatching, viral screening (HIV, Hepatitis B/C, Syphilis, Malaria), and physical fitness assessments prior to any transfusion.
        </p>
        <h2 className="text-lg font-bold text-gray-900">3. Non-Commercial Voluntary Use</h2>
        <p>
          Blood donation is a humanitarian volunteer gift. Buying, selling, or extorting payment for blood donations is strictly prohibited and subject to account banning and legal referral.
        </p>
      </div>
    </div>
  );
}
