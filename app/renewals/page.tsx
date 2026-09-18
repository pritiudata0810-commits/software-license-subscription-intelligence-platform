'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarClock,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';

export default function RenewalsPage() {
  const { user } = useAuth();
  const [renewals, setRenewals] = useState<any[]>([]);
  const [counts, setCounts] = useState({ expired: 0, due7: 0, due30: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPIRED' | 'DUE_7_DAYS' | 'DUE_30_DAYS' | 'UPCOMING'>('ALL');
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/renewals');
      const data = await res.json();
      if (data.success) {
        setRenewals(data.renewals);
        setCounts({
          expired: data.expiredCount || 0,
          due7: data.due7DaysCount || 0,
          due30: data.due30DaysCount || 0,
          upcoming: data.upcomingCount || 0,
        });
      }
    } catch (err) {
      console.error('Error loading renewals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleToggleAutoRenew = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/renewals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, autoRenew: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Auto-renew ${!currentVal ? 'enabled' : 'disabled'}.`);
        fetchRenewals();
      }
    } catch (err: any) {
      setError('Failed to update renewal');
    }
  };

  const handleMarkRenewed = async (id: string) => {
    try {
      const newRenewalDate = new Date();
      newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);

      const res = await fetch('/api/renewals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          renewalDate: newRenewalDate.toISOString(),
          status: 'UPCOMING',
          notes: `Renewed on ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Contract renewal logged. Next cycle set for 1 year ahead.');
        fetchRenewals();
      }
    } catch (err: any) {
      setError('Error renewing contract');
    }
  };

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const filteredRenewals = renewals.filter((r) => {
    const swName = r.software?.name || '';
    const matchesSearch = swName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'ALL') return true;
    return r.computedStatus === activeTab;
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Contract Renewals & Risk</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay ahead of contract expirations, prevent unplanned auto-renewals, and optimize seat counts before signing.
          </p>
        </div>

        <button
          onClick={fetchRenewals}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Renewal Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            activeTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Renewals ({renewals.length})
        </button>
        <button
          onClick={() => setActiveTab('EXPIRED')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'EXPIRED'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Expired ({counts.expired})</span>
        </button>
        <button
          onClick={() => setActiveTab('DUE_7_DAYS')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'DUE_7_DAYS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Due in 7 Days ({counts.due7})</span>
        </button>
        <button
          onClick={() => setActiveTab('DUE_30_DAYS')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'DUE_30_DAYS'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          <Calendar className="w-3 h-3" />
          <span>Due in 30 Days ({counts.due30})</span>
        </button>
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            activeTab === 'UPCOMING'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Future ({counts.upcoming})
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search software renewal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredRenewals.length} contract(s) listed
        </span>
      </div>

      {/* Renewals Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Software & Vendor</th>
                <th className="py-3.5 px-4">Seats (Active/Tot)</th>
                <th className="py-3.5 px-4">Utilization</th>
                <th className="py-3.5 px-4">Monthly Cost</th>
                <th className="py-3.5 px-4">Renewal Date</th>
                <th className="py-3.5 px-4">Deadline Status</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Auto-Renew</th>
                {canManage && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRenewals.length > 0 ? (
                filteredRenewals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.software?.name}</div>
                      <div className="text-[10px] text-slate-400">{r.software?.vendor?.name}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span className="font-bold text-slate-900">{r.activeQuantity}</span>
                      <span className="text-slate-400"> / {r.totalQuantity} seats</span>
                      {r.unusedQuantity > 0 && (
                        <div className="text-[10px] text-rose-500 font-semibold">
                          {r.unusedQuantity} seats idle ({formatINR(r.potentialWastedSpend)}/mo)
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${r.utilizationRate >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {r.utilizationRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatINR(r.estimatedCost)}/mo
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {new Date(r.renewalDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.daysUntilRenewal < 0
                            ? 'bg-rose-100 text-rose-700'
                            : r.daysUntilRenewal <= 7
                            ? 'bg-rose-100 text-rose-700'
                            : r.daysUntilRenewal <= 30
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.daysUntilRenewal < 0
                          ? `Expired (${Math.abs(r.daysUntilRenewal)}d ago)`
                          : r.daysUntilRenewal === 0
                          ? 'Today'
                          : `${r.daysUntilRenewal} Days`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          r.computedRisk === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : r.computedRisk === 'HIGH'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {r.computedRisk}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {canManage ? (
                        <button
                          onClick={() => handleToggleAutoRenew(r.id, r.autoRenew)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.autoRenew ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.autoRenew ? 'Enabled' : 'Disabled'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {r.autoRenew ? 'Yes' : 'No'}
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleMarkRenewed(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition"
                        >
                          Mark Renewed
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManage ? 9 : 8} className="py-10 text-center text-slate-400">
                    No contracts in this renewal window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
