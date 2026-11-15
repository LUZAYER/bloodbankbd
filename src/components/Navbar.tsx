'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Heart,
  Search,
  PlusCircle,
  Bell,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  MapPin,
  Activity,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          // fetch notifications count
          const notifRes = await fetch('/api/notifications');
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            setUnreadCount(notifData.unreadCount || 0);
          }
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-bloody-panel/95 backdrop-blur-md border-b border-gray-200 dark:border-bloody-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-600/30 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
                Blood<span className="text-blood-600 dark:text-rose-500">Bond</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-rose-300/60">
                Bangladesh
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                pathname === '/dashboard'
                  ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                  : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-bloody-card'
              }`}
            >
              <Activity className="w-4 h-4 text-blood-600 dark:text-rose-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/map"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                pathname === '/map'
                  ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                  : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-bloody-card'
              }`}
            >
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <MapPin className="w-4 h-4 text-blood-600 dark:text-rose-500" />
              <span>Live Map</span>
            </Link>

            <Link
              href="/search"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                pathname === '/search'
                  ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                  : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-bloody-card'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Find Blood</span>
            </Link>

            <Link
              href="/requests/new"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                pathname === '/requests/new'
                  ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                  : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-bloody-card'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Emergency Request</span>
            </Link>

            {currentUser?.role === 'DONOR' && (
              <>
                <Link
                  href="/donor/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname.startsWith('/donor/dashboard')
                      ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                      : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white'
                  }`}
                >
                  Donor Dashboard
                </Link>
                <Link
                  href="/donor/history"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname.startsWith('/donor/history')
                      ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                      : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white'
                  }`}
                >
                  History
                </Link>
              </>
            )}

            {currentUser?.role === 'SEEKER' && (
              <Link
                href="/seeker/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  pathname.startsWith('/seeker')
                    ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                    : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white'
                }`}
              >
                Seeker Dashboard
              </Link>
            )}

            {currentUser?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70 dark:border dark:border-bloody-border'
                    : 'text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-blood-600 dark:text-rose-500" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* User actions & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-lg text-gray-600 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-bloody-card transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-blood-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center pl-2 border-l border-gray-200 dark:border-bloody-border space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blood-100 dark:bg-bloody-card border dark:border-bloody-border text-blood-700 dark:text-rose-300 font-bold flex items-center justify-center text-xs">
                    {currentUser.donorProfile?.bloodGroup || currentUser.role[0]}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-gray-800 dark:text-rose-100 line-clamp-1">
                      {currentUser.donorProfile?.fullName || currentUser.phone}
                    </p>
                    <span className="text-gray-500 dark:text-rose-300/60 capitalize">
                      {currentUser.role.toLowerCase()}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-bloody-card transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-rose-200/80 hover:text-blood-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-bloody-card rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register/donor"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blood-600 hover:bg-blood-700 rounded-lg shadow-sm transition-all shadow-blood-600/30"
                >
                  Become a Donor
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle showLabel={false} />
            {currentUser && (
              <Link href="/notifications" className="relative p-2 text-gray-600 dark:text-rose-300">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-blood-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-rose-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-bloody-border bg-white dark:bg-bloody-panel px-4 pt-3 pb-5 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
          >
            <Activity className="w-5 h-5 text-blood-600 dark:text-rose-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-semibold text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
          >
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <MapPin className="w-5 h-5 text-blood-600 dark:text-rose-500" />
            <span>Live Donor Map</span>
          </Link>
          <Link
            href="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
          >
            Find Blood Donors
          </Link>
          <Link
            href="/requests/new"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
          >
            Create Emergency Request
          </Link>
          {currentUser?.role === 'DONOR' && (
            <>
              <Link
                href="/donor/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
              >
                Donor Dashboard
              </Link>
              <Link
                href="/donor/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
              >
                Donation History
              </Link>
            </>
          )}
          {currentUser?.role === 'SEEKER' && (
            <Link
              href="/seeker/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
            >
              Seeker Dashboard
            </Link>
          )}
          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-blood-700 bg-blood-50 dark:text-rose-200 dark:bg-blood-950/70"
            >
              Admin Console
            </Link>
          )}
          <div className="pt-3 border-t border-gray-100 dark:border-bloody-border flex flex-col space-y-2">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-bloody-card rounded-lg"
              >
                Sign Out ({currentUser.phone})
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center rounded-lg text-base font-medium text-gray-800 dark:text-rose-100 hover:bg-gray-50 dark:hover:bg-bloody-card"
                >
                  Sign In
                </Link>
                <Link
                  href="/register/donor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-center rounded-lg text-base font-semibold text-white bg-blood-600 hover:bg-blood-700 shadow"
                >
                  Become a Voluntary Donor
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
