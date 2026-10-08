'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  TrendingDown,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningEngine, setRunningEngine] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const recRes = await fetch('/api/recommendations');
      if (recRes.ok) {
        const data = await recRes.json();
        if (data.success) setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRunEngine = async () => {
    setRunningEngine(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/recommendations', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || 'Intelligence engine evaluated live PostgreSQL database.');
        fetchRecommendations();
      } else {
        setError(data.error || 'Failed to evaluate recommendations');
      }
    } catch (err: any) {
      setError(err.message || 'Engine execution failed');
    } finally {
      setRunningEngine(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'ACCEPTED' | 'DISMISSED') => {
    try {
      const res = await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Recommendation marked as ${status.toLowerCase()}.`);
        setRecommendations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const filteredRecs = recommendations.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const totalMonthlySavings = recommendations
    .filter((r) => r.status !== 'DISMISSED')
    .reduce((acc, r) => acc + (r.estimatedMonthlySavings || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            AI Optimization & Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explainable rule-based decision intelligence supporting contract right-sizing, license reuse, and overlap consolidation.
          </p>
        </div>

        <button
          onClick={handleRunEngine}
          disabled={runningEngine}
          className="px-4 py-2.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition self-start disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${runningEngine ? 'animate-spin' : ''}`} />
          <span>{runningEngine ? 'Evaluating Rules...' : 'Run Intelligence Audit'}</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* TOP ROW: Pastel KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Pastel Mint (Monthly / Yearly Savings) */}
        <div className="p-6 rounded-[28px] bg-[#D7EFEA] flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {viewMode === 'yearly' ? 'Annual Recovery Potential' : 'Monthly Savings Potential'}
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(viewMode === 'yearly' ? totalMonthlySavings * 12 : totalMonthlySavings)}
            </span>
            <span className="text-xs font-bold text-teal-800 bg-white/70 px-2.5 py-1 rounded-full">
              {viewMode === 'yearly' ? 'per year' : 'per month'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            {viewMode === 'yearly'
              ? `${formatINR(totalMonthlySavings)}/mo immediate recovery`
              : `${formatINR(totalMonthlySavings * 12)} annual recovery`}
          </span>
        </div>

        {/* Card 2: Pastel Lemon (Active Opportunities) */}
        <div className="p-6 rounded-[28px] bg-[#FEF1C9] flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Actionable Opportunities
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {recommendations.length}
            </span>
            <span className="text-xs font-bold text-amber-900 bg-white/70 px-2.5 py-1 rounded-full">
              audited
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            Rules 1, 2, 3 & 5 evaluated
          </span>
        </div>

        {/* Card 3: Pastel Lavender (Decision Confidence) */}
        <div className="p-6 rounded-[28px] bg-[#E3DCFD] flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Algorithm Confidence
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              100%
            </span>
            <span className="text-xs font-bold text-purple-900 bg-white/70 px-2.5 py-1 rounded-full">
              Deterministic
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1">
            Strict threshold benchmarks
          </span>
        </div>
      </div>

      {/* Filter Tabs & Period Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-slate-100 shadow-xs text-xs w-fit">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              filterStatus === 'ALL'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({recommendations.length})
          </button>
          <button
            onClick={() => setFilterStatus('NEW')}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              filterStatus === 'NEW'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            New ({recommendations.filter((r) => r.status === 'NEW').length})
          </button>
          <button
            onClick={() => setFilterStatus('ACCEPTED')}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              filterStatus === 'ACCEPTED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Accepted ({recommendations.filter((r) => r.status === 'ACCEPTED').length})
          </button>
          <button
            onClick={() => setFilterStatus('DISMISSED')}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              filterStatus === 'DISMISSED'
                ? 'bg-slate-400 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Dismissed ({recommendations.filter((r) => r.status === 'DISMISSED').length})
          </button>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
              viewMode === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Recommendations Cards Feed */}
      <div className="space-y-4">
        {filteredRecs.length > 0 ? (
          filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className="p-6 rounded-[30px] bg-white border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rec.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700'
                        : rec.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {rec.type.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>

                <div className="p-3.5 rounded-2xl bg-[#F8FAFA] text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Action Plan: </span>
                  <span>{rec.suggestedAction}</span>
                </div>
              </div>

              {/* Savings & Actions */}
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {rec.estimatedMonthlySavings > 0 && (
                  <div className="text-left md:text-right">
                    <div className="text-base font-extrabold text-emerald-600">
                      {viewMode === 'yearly'
                        ? `+${formatINR(rec.estimatedAnnualSavings)}/yr`
                        : `+${formatINR(rec.estimatedMonthlySavings)}/mo`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {viewMode === 'yearly'
                        ? `+${formatINR(rec.estimatedMonthlySavings)} / month`
                        : `+${formatINR(rec.estimatedAnnualSavings)} / year`}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {rec.status === 'NEW' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(rec.id, 'ACCEPTED')}
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rec.id, 'DISMISSED')}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        rec.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rec.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center rounded-[32px] bg-white border border-slate-100">
            <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No recommendations match filter.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click &apos;Run Intelligence Audit&apos; to re-evaluate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
