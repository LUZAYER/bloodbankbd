'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Lock, Phone, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push(data.redirectUrl || '/donor/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch {
      setError('Connection failure. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-bloody-panel p-8 rounded-3xl border border-gray-200 dark:border-bloody-border shadow-xl shadow-gray-200/50 dark:shadow-2xl dark:shadow-black/80 transition-colors">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blood-500/20">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Sign In to BloodBond
          </h2>
          <p className="text-xs text-gray-500 dark:text-rose-300/70">
            Access your donor dashboard, emergency requests, or admin console.
          </p>
        </div>

        {/* 1-Click Demo Accounts Pill Box */}
        <div className="bg-slate-50 dark:bg-bloody-card border border-slate-200 dark:border-bloody-border rounded-2xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-rose-300/70">
            ⚡ Quick Test / Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoCredentials('01711111111', 'DonorPassword123!')}
              className="py-1.5 px-2 bg-white dark:bg-bloody-panel hover:bg-blood-50 dark:hover:bg-bloody-cardHover border border-gray-200 dark:border-bloody-border hover:border-blood-300 rounded-lg text-[11px] font-bold text-gray-800 dark:text-rose-200 transition-colors"
            >
              Donor (Wari O+)
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('01811111111', 'SeekerPassword123!')}
              className="py-1.5 px-2 bg-white dark:bg-bloody-panel hover:bg-blood-50 dark:hover:bg-bloody-cardHover border border-gray-200 dark:border-bloody-border hover:border-blood-300 rounded-lg text-[11px] font-bold text-gray-800 dark:text-rose-200 transition-colors"
            >
              Blood Seeker
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@bloodbond.bd', 'AdminPassword123!')}
              className="py-1.5 px-2 bg-white dark:bg-bloody-panel hover:bg-blood-50 dark:hover:bg-bloody-cardHover border border-gray-200 dark:border-bloody-border hover:border-blood-300 rounded-lg text-[11px] font-bold text-gray-800 dark:text-rose-200 transition-colors"
            >
              Administrator
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-blood-950/80 border border-red-200 dark:border-bloody-border rounded-xl text-xs font-semibold text-red-700 dark:text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300 mb-1">
              Mobile Number or Email
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 dark:text-rose-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 01711111111 or email@domain.com"
                className="w-full text-sm font-medium pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-bloody-border bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:bg-white dark:focus:bg-bloody-panel focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase text-gray-600 dark:text-rose-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 dark:text-rose-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm font-medium pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-bloody-border bg-gray-50 dark:bg-bloody-card text-gray-900 dark:text-rose-100 placeholder-gray-400 dark:placeholder-rose-300/40 focus:bg-white dark:focus:bg-bloody-panel focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blood-600 hover:bg-blood-700 text-white font-extrabold rounded-xl shadow-lg shadow-blood-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-gray-100 dark:border-bloody-border text-center text-xs text-gray-600 dark:text-rose-300/70 space-y-2">
          <p>
            Don't have an account yet?
          </p>
          <div className="flex justify-center space-x-3">
            <Link
              href="/register/donor"
              className="font-bold text-blood-600 dark:text-rose-400 hover:underline"
            >
              Register as Donor
            </Link>
            <span className="text-gray-300 dark:text-rose-900">•</span>
            <Link
              href="/register/seeker"
              className="font-bold text-gray-800 dark:text-rose-200 hover:underline"
            >
              Register as Seeker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
