'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  Building2,
  KeyRound,
  UserCheck,
  TrendingUp,
  DollarSign,
  CalendarClock,
  AlertTriangle,
  Lightbulb,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [anRes, hlRes, alRes, rcRes, rnRes, rqRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/analytics/health'),
        fetch('/api/alerts'),
        fetch('/api/recommendations'),
        fetch('/api/renewals'),
        fetch('/api/requests'),
      ]);

      if (anRes.ok) {
        const d = await anRes.json();
        if (d.success) setAnalytics(d.analytics);
      }
      if (hlRes.ok) {
        const d = await hlRes.json();
        if (d.success) setHealth(d.health);
      }
      if (alRes.ok) {
        const d = await alRes.json();
        if (d.success) setAlerts(d.alerts || []);
      }
      if (rcRes.ok) {
        const d = await rcRes.json();
        if (d.success) setRecommendations(d.recommendations || []);
      }
      if (rnRes.ok) {
        const d = await rnRes.json();
        if (d.success) setRenewals(d.renewals || []);
      }
      if (rqRes.ok) {
        const d = await rqRes.json();
        if (d.success) setRequests(d.requests || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Aggregating live PostgreSQL intelligence metrics...</p>
      </div>
    );
  }

  // Format currency helpers (INR ₹)
  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  // Chart datasets derived from real DB data
  const utilizationChartData = (analytics?.softwareBreakdown || []).slice(0, 7).map((sw: any) => ({
    name: sw.softwareName.length > 12 ? sw.softwareName.substring(0, 12) + '...' : sw.softwareName,
    utilization: sw.utilizationRate,
    active: sw.activeLicenses,
    unused: sw.unusedLicenses,
  }));

  const costDistributionData = (analytics?.softwareBreakdown || []).slice(0, 6).map((sw: any) => ({
    name: sw.softwareName.length > 10 ? sw.softwareName.substring(0, 10) + '...' : sw.softwareName,
    allocated: sw.monthlyCost - sw.unusedMonthlyCost,
    wasted: sw.unusedMonthlyCost,
  }));

  const departmentSpendData = (analytics?.departmentBreakdown || []).map((d: any) => ({
    name: d.departmentCode,
    fullName: d.departmentName,
    spend: d.actualMonthlySpend,
    budget: d.monthlyBudget,
  }));

  const COLORS = ['#2563EB', '#0284C7', '#0D9488', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const upcomingRenewalsCount = renewals.filter((r) => r.daysUntilRenewal >= 0 && r.daysUntilRenewal <= 30).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Executive Intelligence Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
              Live PostgreSQL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time SaaS utilization, financial governance, contract risk, and explainable AI optimization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/reports"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* Critical Alert Banner (if any) */}
      {criticalAlertsCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-900 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">
                {criticalAlertsCount} Critical Contract / License Alert{criticalAlertsCount > 1 ? 's' : ''} Require Immediate Attention
              </div>
              <div className="text-[11px] text-rose-700 mt-0.5">
                {alerts.find((a) => a.severity === 'CRITICAL')?.title || 'Expired contracts or high idle expenditure detected.'}
              </div>
            </div>
          </div>
          <Link
            href="/risk-alerts"
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap shadow-sm transition"
          >
            Review Alerts
          </Link>
        </div>
      )}

      {/* TOP ROW: 12 Key Metrics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {/* Total Software */}
        <Link
          href="/software"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Software</span>
            <Layers className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {analytics?.totalSoftware || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Catalog items</div>
        </Link>

        {/* Total Licenses */}
        <Link
          href="/licenses"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Seats</span>
            <KeyRound className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {analytics?.totalLicenses || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {analytics?.activeLicenses || 0} active ({analytics?.availableLicenses || 0} idle)
          </div>
        </Link>

        {/* Overall Utilization */}
        <Link
          href="/analytics/usage"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Utilization</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {analytics?.overallUtilization || 0}%
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">
            Target benchmark &gt; 75%
          </div>
        </Link>

        {/* Monthly Expenditure */}
        <Link
          href="/analytics/costs"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Monthly Spend</span>
            <DollarSign className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
            {formatINR(analytics?.monthlyExpenditure)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Annual: {formatINR(analytics?.annualExpenditure)}
          </div>
        </Link>

        {/* Potential Savings */}
        <Link
          href="/analytics/costs"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Idle Waste</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-lg md:text-xl font-bold text-rose-600 tracking-tight">
            {formatINR(analytics?.potentialMonthlySavings)}/mo
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Save {formatINR(analytics?.potentialAnnualSavings)}/yr
          </div>
        </Link>

        {/* Pending Requests & Renewals */}
        <Link
          href="/requests"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pending Actions</span>
            <Compass className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {pendingRequestsCount} Req / {upcomingRenewalsCount} Ren
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">
            Approvals & Contract renewals
          </div>
        </Link>
      </div>

      {/* SECOND ROW: GeneX Health Score + Utilization Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* License Health Score (GeneX Inspired) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">License Health Score</h2>
                  <p className="text-[10px] text-slate-500">Deterministic Multi-Factor Model</p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  (health?.totalScore || 0) >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {health?.status || 'HEALTHY'}
              </span>
            </div>

            {/* Score Big Display */}
            <div className="my-6 text-center">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                  {health?.totalScore || 0}
                </span>
                <span className="text-lg font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Overall platform efficiency, renewal readiness, and seat waste control
              </p>
            </div>

            {/* Health Factor Breakdown */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Utilization Factor</span>
                  <span className="font-bold text-slate-900">{health?.utilizationScore || 0} / 35</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${((health?.utilizationScore || 0) / 35) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Cost Efficiency</span>
                  <span className="font-bold text-slate-900">{health?.costEfficiencyScore || 0} / 25</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${((health?.costEfficiencyScore || 0) / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Renewal Risk Factor</span>
                  <span className="font-bold text-slate-900">{health?.renewalRiskScore || 0} / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${((health?.renewalRiskScore || 0) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Unused Seat Minimization</span>
                  <span className="font-bold text-slate-900">{health?.unusedLicensesScore || 0} / 10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${((health?.unusedLicensesScore || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Overlap / Redundancy Safety</span>
                  <span className="font-bold text-slate-900">{health?.overlapRiskScore || 0} / 10</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${((health?.overlapRiskScore || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/recommendations"
            className="mt-6 w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <span>View Optimization Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* License Utilization Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Software Utilization Spectrum (%)</h2>
                <p className="text-[10px] text-slate-500">Live active vs allocated license proportions</p>
              </div>
              <Link href="/analytics/usage" className="text-xs font-semibold text-blue-600 hover:underline">
                Full Analytics &rarr;
              </Link>
            </div>

            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} unit="%" />
                  <Tooltip
                    formatter={(val: any, name: string) => [
                      name === 'utilization' ? `${val}%` : val,
                      name === 'utilization' ? 'Utilization' : name === 'active' ? 'Active Seats' : 'Unused Seats',
                    ]}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="active" fill="#2563EB" name="Active Seats" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unused" fill="#F87171" name="Unused Seats" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Low threshold flagged at &lt; 70%</span>
            <span className="font-semibold text-rose-600">
              {analytics?.underutilizedCount || 0} Software Products Underutilized
            </span>
          </div>
        </div>
      </div>

      {/* THIRD ROW: Cost Spend Breakdown + Department Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Software Monthly Cost vs Idle Waste */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Spend vs Idle Waste (₹)</h2>
              <p className="text-[10px] text-slate-500">Monthly expenditure vs potential contract savings</p>
            </div>
            <Link href="/analytics/costs" className="text-xs font-semibold text-blue-600 hover:underline">
              Cost Details
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costDistributionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v: any) => [formatINR(v)]}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="allocated" stackId="a" fill="#3B82F6" name="Utilized Spend" />
                <Bar dataKey="wasted" stackId="a" fill="#EF4444" name="Idle Waste (Unused)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-Wise Cost Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Department Budget vs Actual Spend</h2>
              <p className="text-[10px] text-slate-500">Expenditure allocation across organization units</p>
            </div>
            <Link href="/departments" className="text-xs font-semibold text-blue-600 hover:underline">
              Departments
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentSpendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v: any, name: string) => [
                    formatINR(v),
                    name === 'spend' ? 'Actual Monthly Spend' : 'Monthly Budget',
                  ]}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="budget" fill="#E2E8F0" name="Monthly Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spend" fill="#0EA5E9" name="Actual Spend" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FOURTH ROW: Recommendations Feed + Critical Upcoming Renewals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Explainable Recommendations */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Explainable AI Recommendations</h2>
            </div>
            <Link href="/recommendations" className="text-xs font-semibold text-blue-600 hover:underline">
              View All ({recommendations.length})
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div
                key={rec.id || i}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        rec.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700'
                          : rec.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {rec.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{rec.title}</span>
                  </div>
                  {rec.estimatedMonthlySavings > 0 && (
                    <span className="text-[11px] font-bold text-emerald-600">
                      +{formatINR(rec.estimatedMonthlySavings)}/mo
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{rec.reason}</p>
                <div className="mt-2 text-[10px] text-blue-600 font-medium flex items-center gap-1">
                  <span>Action:</span>
                  <span className="text-slate-700">{rec.suggestedAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Renewals & Risk Management */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Upcoming Renewals & Risk</h2>
            </div>
            <Link href="/renewals" className="text-xs font-semibold text-blue-600 hover:underline">
              Renewals Calendar
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {renewals.slice(0, 4).map((r, i) => (
              <div key={r.id || i} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {r.software?.name || 'Software Subscription'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Renews: {new Date(r.renewalDate).toLocaleDateString()} • {r.totalQuantity} seats @{' '}
                    {formatINR(r.estimatedCost)}/mo
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
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
                      ? 'Expired'
                      : r.daysUntilRenewal === 0
                      ? 'Today'
                      : `${r.daysUntilRenewal}d remaining`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
