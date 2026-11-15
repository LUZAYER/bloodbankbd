import React from 'react';
import Link from 'next/link';
import { Heart, Phone, ShieldCheck, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-bloody-panel text-gray-600 dark:text-rose-200/80 mt-20 border-t border-gray-200 dark:border-bloody-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-600/30">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Blood<span className="text-blood-600 dark:text-rose-500">Bond</span> BD
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-rose-300/70 leading-relaxed">
              Bangladesh&apos;s AI-assisted emergency blood donor discovery platform, uniting voluntary donors across all 8 divisions and 64 districts.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified &amp; Privacy Protected</span>
            </div>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              Emergency Hotlines
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-rose-300/70">
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blood-600 dark:text-rose-400" />
                <span>National Emergency: <strong className="text-gray-900 dark:text-white">999</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blood-600 dark:text-rose-400" />
                <span>Health Hotline: <strong className="text-gray-900 dark:text-white">16263</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blood-600 dark:text-rose-400" />
                <span>Red Crescent Blood: <strong className="text-gray-900 dark:text-white">02-9352226</strong></span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              Platform Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/map" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live Donor Map</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-rose-300/80 hover:text-blood-600 dark:hover:text-white transition-colors">
                  General Dashboard
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-600 dark:text-rose-300/80 hover:text-blood-600 dark:hover:text-white transition-colors">
                  Find Blood Donors
                </Link>
              </li>
              <li>
                <Link href="/requests/new" className="text-gray-600 dark:text-rose-300/80 hover:text-blood-600 dark:hover:text-white transition-colors">
                  Create Emergency Request
                </Link>
              </li>
              <li>
                <Link href="/register/donor" className="text-gray-600 dark:text-rose-300/80 hover:text-blood-600 dark:hover:text-white transition-colors">
                  Donor Registration
                </Link>
              </li>
              <li>
                <Link href="/register/seeker" className="text-gray-600 dark:text-rose-300/80 hover:text-blood-600 dark:hover:text-white transition-colors">
                  Blood Seeker Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Medical Notice */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              Safety &amp; Governance
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-rose-300/80">
              <li>
                <Link href="/about" className="hover:text-blood-600 dark:hover:text-white transition-colors">
                  About Platform
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blood-600 dark:hover:text-white transition-colors">
                  Privacy Policy &amp; Data Rights
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blood-600 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="mt-4 flex items-center space-x-1 text-xs text-gray-400 dark:text-rose-400/60">
              <MapPin className="w-3.5 h-3.5 text-blood-600 dark:text-rose-500" />
              <span>Dhaka • Chattogram • All 64 Districts</span>
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-bloody-border text-xs text-gray-500 dark:text-rose-400/60 leading-relaxed text-center max-w-4xl mx-auto">
          <p>
            <strong>Medical Disclaimer:</strong> BloodBond Bangladesh is a voluntary donor-connection platform. It does not perform clinical blood banking, transfusion therapy, or crossmatching. Laboratory screening and medical clearance must always be performed by licensed hospitals or certified blood centers before any blood transfusion.
          </p>
          <p className="mt-2 text-gray-400 dark:text-rose-400/50">
            &copy; {new Date().getFullYear()} BloodBond Bangladesh. Built for emergency humanitarian support.
          </p>
        </div>
      </div>
    </footer>
  );
}
