'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Activity,
  Settings,
  FileText,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'donors' | 'policy' | 'audits'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Policy Form
  const [policyInterval, setPolicyInterval] = useState(90);
  const [policyName, setPolicyName] = useState('');
  const [isUpdatingPolicy, setIsUpdatingPolicy] = useState(false);
  const [policyMessage, setPolicyMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      if (!meData.success || meData.user?.role !== 'ADMIN') {
        router.push('/login');
        return;
      }

      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats(s.data);
        if (s.data?.policy) {
          setPolicyInterval(s.data.policy.intervalDays);
          setPolicyName(s.data.policy.name);
        }
      }

      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsersList(u.data || []);
      }

      // Fetch audits
      const auditRes = await fetch('/api/admin/audit-logs');
      if (auditRes.ok) {
        const a = await auditRes.json();
        setAuditLogs(a.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDonor = async (donorProfileId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorProfileId, verificationStatus: status }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentActive }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPolicy(true);
    setPolicyMessage(null);

    try {
      const res = await fetch('/api/admin/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intervalDays: policyInterval,
          name: policyName,
          description: `Updated by administrator to ${policyInterval} days cooldown.`,
        }),
      });

      if (res.ok) {
        setPolicyMessage('Eligibility policy version updated successfully!');
        fetchAdminData();
      } else {
        alert('Failed to update policy.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setIsUpdatingPolicy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-gray-500 font-semibold">
        Verifying administrator credentials...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blood-600 flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Administrative Governance Console</span>
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-1">
            System Administration
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage donors across all 64 districts, verify profiles, adjust eligibility policies, and inspect audit logs.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-xl shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blood-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-blood-600 text-blood-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('donors')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'donors'
              ? 'border-blood-600 text-blood-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Donor Verification & Accounts ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'policy'
              ? 'border-blood-600 text-blood-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Eligibility & Safety Policy
        </button>
        <button
          onClick={() => setActiveTab('audits')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'audits'
              ? 'border-blood-600 text-blood-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Total Users</span>
              <p className="text-3xl font-black text-gray-900 mt-1">{stats.totalUsers}</p>
              <span className="text-[11px] text-gray-500">Donors + Seekers + Admin</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Verified Donors</span>
              <p className="text-3xl font-black text-emerald-700 mt-1">{stats.verifiedDonors}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Of {stats.totalDonors} total donors</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Open Blood Requests</span>
              <p className="text-3xl font-black text-blood-700 mt-1">{stats.openRequests}</p>
              <span className="text-[11px] text-gray-500">Of {stats.totalRequests} historical</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-400">Recorded Transfusions</span>
              <p className="text-3xl font-black text-purple-700 mt-1">{stats.totalDonationRecords}</p>
              <span className="text-[11px] text-gray-500">Logged by donors</span>
            </div>
          </div>

          {/* Blood Group Breakdown */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-gray-900">
              Registered Donors by Blood Group
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {stats.bloodGroupCounts &&
                Object.entries(stats.bloodGroupCounts).map(([bg, count]: any) => (
                  <div
                    key={bg}
                    className="p-3 rounded-2xl border border-red-100 bg-red-50/40 text-center"
                  >
                    <span className="text-lg font-black text-blood-700">{bg}</span>
                    <p className="text-xs font-bold text-gray-600 mt-0.5">{count} donor(s)</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Donor Accounts */}
      {activeTab === 'donors' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-900">
            Registered Accounts & Verification Status
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-gray-400 uppercase font-bold tracking-wider">
                  <th className="pb-3">User / Donor</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Blood Group</th>
                  <th className="pb-3">District / Area</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => {
                  const dp = u.donorProfile;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/80">
                      <td className="py-3.5">
                        <span className="font-extrabold text-gray-900 block">
                          {dp?.fullName || u.phone}
                        </span>
                        <span className="text-[11px] text-gray-400">{u.phone}</span>
                      </td>

                      <td className="py-3.5 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'DONOR'
                              ? 'bg-red-100 text-blood-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 font-black text-blood-700">
                        {dp ? dp.bloodGroup : '—'}
                      </td>

                      <td className="py-3.5 text-gray-600">
                        {dp ? `${dp.areaName}, ${dp.district?.name || dp.districtId}` : '—'}
                      </td>

                      <td className="py-3.5">
                        {dp ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              dp.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {dp.verificationStatus}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3.5 text-right space-x-1.5">
                        {dp && dp.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyDonor(dp.id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                          >
                            Verify
                          </button>
                        )}
                        {dp && dp.verificationStatus === 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyDonor(dp.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[11px]"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleUserActive(u.id, u.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Policy Configuration */}
      {activeTab === 'policy' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">
              National Blood Safety & Cooldown Policy
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Configure the minimum cooldown interval between red blood cell donations. Updates automatically version the policy in the database.
            </p>
          </div>

          {policyMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
              {policyMessage}
            </div>
          )}

          <form onSubmit={handleUpdatePolicy} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Policy Name
              </label>
              <input
                type="text"
                required
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Mandatory Safety Interval (Days between donations)
              </label>
              <input
                type="number"
                min="30"
                max="180"
                required
                value={policyInterval}
                onChange={(e) => setPolicyInterval(parseInt(e.target.value, 10))}
                className="w-full text-sm font-semibold p-2.5 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white"
              />
              <span className="text-[11px] text-gray-400 block mt-1">
                Standard Bangladesh DGHS / WHO recommendation is 90 days for whole blood donations.
              </span>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPolicy}
              className="py-3 px-6 bg-blood-600 hover:bg-blood-700 text-white font-black rounded-xl text-xs shadow-md transition-all"
            >
              {isUpdatingPolicy ? 'Saving Policy...' : 'Save & Enforce New Policy'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audits' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-gray-900">
            Immutable Audit Trail & System Actions
          </h3>

          <div className="divide-y divide-gray-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between">
                <div>
                  <span className="font-black text-gray-900">{log.action}</span>
                  <p className="text-gray-500">Resource: {log.resource}</p>
                  {log.details && (
                    <code className="text-[10px] text-gray-600 bg-gray-50 px-1 py-0.5 rounded">
                      {log.details}
                    </code>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
