'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Lightbulb,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingDown,
  AlertCircle,
  Filter,
  DollarSign,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningEngine, setRunningEngine] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const [recRes, hlRes] = await Promise.all([
        fetch('/api/recommendations'),
        fetch('/api/analytics/health'),
      ]);

      if (recRes.ok) {
        const data = await recRes.json();
        if (data.success) setRecommendations(data.recommendations);
      }
      if (hlRes.ok) {
        const hData = await hlRes.json();
        if (hData.success) setHealth(hData.health);
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            AI Intelligence & Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explainable rule-based decision intelligence supporting contract right-sizing, license reuse, and overlap consolidation.
          </p>
        </div>

        <button
          onClick={handleRunEngine}
          disabled={runningEngine}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-600/20 transition self-start disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${runningEngine ? 'animate-spin' : ''}`} />
          <span>{runningEngine ? 'Analyzing Database...' : 'Run Intelligence Audit'}</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* TOP ROW: License Health Score Card (GeneX Style) + Total Savings Potential */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deterministic Health Score */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">License Health Score</h2>
                  <p className="text-[10px] text-slate-500">Documented Deterministic Model</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  (health?.totalScore || 0) >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {health?.status || 'HEALTHY'}
              </span>
            </div>

            <div className="my-5 text-center">
              <span className="text-5xl font-extrabold text-slate-900">{health?.totalScore || 0}</span>
              <span className="text-lg font-semibold text-slate-400"> / 100</span>
              <p className="text-[11px] text-slate-500 mt-1">Multi-factor organizational score</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Utilization (max 35)</span>
                <span className="font-bold text-slate-900">{health?.utilizationScore || 0}/35</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cost Efficiency (max 25)</span>
                <span className="font-bold text-slate-900">{health?.costEfficiencyScore || 0}/25</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Renewal Risk Factor (max 20)</span>
                <span className="font-bold text-slate-900">{health?.renewalRiskScore || 0}/20</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Unused Minimization (max 10)</span>
                <span className="font-bold text-slate-900">{health?.unusedLicensesScore || 0}/10</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Overlap Safety (max 10)</span>
                <span className="font-bold text-slate-900">{health?.overlapRiskScore || 0}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings & Rules Summary */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Total Actionable Savings Potential</h2>
                <p className="text-[10px] text-slate-500">Derived from active optimization opportunities</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold text-emerald-600">{formatINR(totalMonthlySavings)}/mo</div>
                <div className="text-[10px] text-slate-400">Save {formatINR(totalMonthlySavings * 12)}/year</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>RULE 1: Idle License Reallocation</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Triggers if utilization &lt; 70% and unused seats exist, prompting seat reduction.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>RULE 2: Existing License Re-Use</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Detects unassigned seats during new employee requests to avoid duplicate purchase.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>RULE 3: Pre-Renewal Contract Review</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Flags approaching renewals (≤30 days) with low utilization to downscale seat count.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>RULE 5: Duplicate Overlap Detection</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Identifies redundant subscriptions across identical functional categories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            filterStatus === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Recommendations ({recommendations.length})
        </button>
        <button
          onClick={() => setFilterStatus('NEW')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            filterStatus === 'NEW'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          New ({recommendations.filter((r) => r.status === 'NEW').length})
        </button>
        <button
          onClick={() => setFilterStatus('ACCEPTED')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            filterStatus === 'ACCEPTED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          Accepted ({recommendations.filter((r) => r.status === 'ACCEPTED').length})
        </button>
        <button
          onClick={() => setFilterStatus('DISMISSED')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            filterStatus === 'DISMISSED'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Dismissed
        </button>
      </div>

      {/* Recommendations Cards Feed */}
      <div className="space-y-4">
        {filteredRecs.length > 0 ? (
          filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                      rec.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700'
                        : rec.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {rec.type.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-blue-600">Action Plan: </span>
                  <span>{rec.suggestedAction}</span>
                </div>
              </div>

              {/* Savings & Actions */}
              <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {rec.estimatedMonthlySavings > 0 && (
                  <div className="text-left md:text-right">
                    <div className="text-base font-extrabold text-emerald-600">
                      +{formatINR(rec.estimatedMonthlySavings)}/mo
                    </div>
                    <div className="text-[10px] text-slate-400">
                      +{formatINR(rec.estimatedAnnualSavings)} / year
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {rec.status === 'NEW' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(rec.id, 'DISMISSED')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold text-xs"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rec.id, 'ACCEPTED')}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs shadow-md shadow-blue-600/20"
                      >
                        Accept Action
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                        rec.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
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
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No active recommendations</h3>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Run Intelligence Audit&quot; to evaluate the live PostgreSQL database against all 5 rules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
