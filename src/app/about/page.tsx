import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, MapPin, Users, Activity } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blood-600">
          Our Humanitarian Mission
        </span>
        <h1 className="text-4xl font-black text-gray-900">
          About BloodBond Bangladesh
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          An AI-powered emergency blood donor discovery platform built to save lives during critical medical moments across all 64 districts of Bangladesh.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6 text-sm text-gray-700 leading-relaxed">
        <h2 className="text-2xl font-black text-gray-900">
          The Problem We Are Solving
        </h2>
        <p>
          In Bangladesh, blood emergencies often force families to make frantic phone calls and post across social media groups while precious minutes slip away. Many willing donors are either unreachable, too far away, or unaware of their medical eligibility cooldown status.
        </p>

        <h2 className="text-2xl font-black text-gray-900 pt-4 border-t">
          How BloodBond Helps
        </h2>
        <p>
          BloodBond Bangladesh introduces a two-stage matching engine:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Stage 1: Deterministic Safety Filtering</strong> — Enforces red blood cell compatibility rules (e.g. O+ recipient safely receives O+ or O- red cells) and verifies the 90-day cooldown period.
          </li>
          <li>
            <strong>Stage 2: Geographic & Proximity Ranking</strong> — Prioritizes donors located in the exact neighborhood (such as Wari, Tikatuli, Dhanmondi) before expanding to nearby areas across the district.
          </li>
          <li>
            <strong>Natural Language AI Processing</strong> — Enables users to enter plain text or voice-transcribed queries in Bangla and English to swiftly trigger search criteria.
          </li>
        </ul>

        <div className="pt-6 border-t flex flex-wrap gap-4">
          <Link
            href="/search"
            className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl text-xs shadow-md"
          >
            Find Blood Donors
          </Link>
          <Link
            href="/register/donor"
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs"
          >
            Register as Volunteer Donor
          </Link>
        </div>
      </div>
    </div>
  );
}
