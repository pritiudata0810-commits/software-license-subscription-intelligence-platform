'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowUpRight,
  RefreshCw,
  Layers,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  KeyRound,
  FileDown,
  Cpu,
  Coins,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [renewals, setRenewals] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [yearlyRecovery, setYearlyRecovery] = useState<any>(null);
  const [tokenConsumption, setTokenConsumption] = useState<any>(null);
  const [financialView, setFinancialView] = useState<'monthly' | 'yearly'>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [anRes, alRes, rnRes, rcRes, yrRes, tkRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/alerts'),
        fetch('/api/renewals'),
        fetch('/api/recommendations'),
        fetch('/api/analytics/yearly-recovery'),
        fetch('/api/analytics/consumption'),
      ]);

      if (anRes.ok) {
        const d = await anRes.json();
        if (d.success) setAnalytics(d.analytics);
      }
      if (alRes.ok) {
        const d = await alRes.json();
        if (d.success) setAlerts(d.alerts || []);
      }
      if (rnRes.ok) {
        const d = await rnRes.json();
        if (d.success) setRenewals(d.renewals || []);
      }
      if (rcRes.ok) {
        const d = await rcRes.json();
        if (d.success) setRecommendations(d.recommendations || []);
      }
      if (yrRes.ok) {
        const d = await yrRes.json();
        if (d.success) setYearlyRecovery(d);
      }
      if (tkRes.ok) {
        const d = await tkRes.json();
        if (d.success) setTokenConsumption(d);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  if (loading && !analytics) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading live PostgreSQL intelligence...</p>
      </div>
    );
  }

  // Real software list from database
  const softwareList = analytics?.softwareBreakdown || [];
  const topSoftware = softwareList.slice(0, 3);

  // Department spend chart dataset (dynamically adjusted for Monthly vs Yearly)
  const departmentData = (analytics?.departmentBreakdown || []).map((d: any) => ({
    name: d.departmentCode,
    fullName: d.departmentName,
    spend: Math.round(financialView === 'yearly' ? d.actualMonthlySpend * 12 : d.actualMonthlySpend),
    budget: Math.round(financialView === 'yearly' ? d.monthlyBudget * 12 : d.monthlyBudget),
  }));

  // Calendar setup for October 2026 (matching media_1791173942344.jpg)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const activeRenewalDays = [16, 17, 24]; // Highlighting active renewal milestones

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-300">
      
      {/* ============================================================== */}
      {/* TWO-COLUMN GRID (Matching media_1791173942344.jpg) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: Activities, Progress Cards & Spend (Col span 7) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-6 lg:space-y-8">
          
          {/* SECTION 1: Your active software */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Your active software{' '}
                <span className="text-slate-400 font-normal">
                  ({softwareList.length || 0})
                </span>
              </h2>
              <Link
                href="/software"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Pastel Software Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1: Pastel Mint (Adobe CC benchmark card) */}
              <Link
                href="/software"
                className="p-5 rounded-[28px] bg-[#D7EFEA] hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[175px] group relative"
              >
                {/* Top: Star rating / utilization pill */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-800 text-[10px] text-white font-bold flex items-center justify-center">
                      AC
                    </div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-teal-600 text-[10px] text-white font-bold flex items-center justify-center">
                      JS
                    </div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-emerald-500 text-[10px] text-white font-bold flex items-center justify-center">
                      PK
                    </div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-white text-[10px] text-slate-700 font-bold flex items-center justify-center shadow-xs">
                      +32
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-bold text-slate-800 shadow-2xs flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span>{topSoftware[0]?.utilizationRate || 70}%</span>
                  </div>
                </div>

                {/* Bottom: Title & Circular Arrow Button */}
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-slate-700">
                      {topSoftware[0]?.softwareName || 'Adobe Creative Cloud'}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {topSoftware[0]?.activeLicenses || 35} of {topSoftware[0]?.totalLicenses || 50} seats assigned
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Card 2: Pastel Rose/Pink (Microsoft 365) */}
              <Link
                href="/software"
                className="p-5 rounded-[28px] bg-[#FDDCE5] hover:shadow-lg transition-all duration-200 flex flex-col justify-between min-h-[175px] group relative"
              >
                {/* Top: Star rating / utilization pill */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-indigo-700 text-[10px] text-white font-bold flex items-center justify-center">
                      MS
                    </div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center">
                      EL
                    </div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-amber-500 text-[10px] text-white font-bold flex items-center justify-center">
                      RD
                    </div>
                    <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-white text-[10px] text-slate-700 font-bold flex items-center justify-center shadow-xs">
                      +26
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-bold text-slate-800 shadow-2xs flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span>{topSoftware[1]?.utilizationRate || 88}%</span>
                  </div>
                </div>

                {/* Bottom: Title & Circular Arrow Button */}
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-slate-700">
                      {topSoftware[1]?.softwareName || 'Microsoft 365 E5'}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {topSoftware[1]?.activeLicenses || 28} active subscriptions
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* SECTION 2: Platform metrics / Optimization Progress (4 Pastel Blocks including Tokens) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Platform metrics
              </h2>
              {/* Financial View Switcher (Monthly | Yearly) */}
              <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => setFinancialView('monthly')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    financialView === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialView('yearly')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    financialView === 'yearly'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Block 1: Pastel Mint (Total Licenses) */}
              <Link
                href="/licenses"
                className="p-5 rounded-[26px] bg-[#D7EFEA] hover:shadow-md transition flex flex-col justify-between min-h-[125px] group"
              >
                <span className="text-xs font-semibold text-slate-600">
                  Total Licenses
                </span>
                <div className="flex items-end justify-between mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {analytics?.totalLicenses || 185}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-2xs group-hover:scale-110 transition">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>

              {/* Block 2: Pastel Lemon (Avg Utilization) */}
              <Link
                href="/analytics/usage"
                className="p-5 rounded-[26px] bg-[#FEF1C9] hover:shadow-md transition flex flex-col justify-between min-h-[125px] group"
              >
                <span className="text-xs font-semibold text-slate-600">
                  Avg Utilization
                </span>
                <div className="flex items-end justify-between mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {analytics?.overallUtilization || 76}%
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-2xs group-hover:scale-110 transition">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>

              {/* Block 3: Pastel Lavender (Active Tools) */}
              <Link
                href="/software"
                className="p-5 rounded-[26px] bg-[#E3DCFD] hover:shadow-md transition flex flex-col justify-between min-h-[125px] group"
              >
                <span className="text-xs font-semibold text-slate-600">
                  Active Tools
                </span>
                <div className="flex items-end justify-between mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {analytics?.totalSoftware || 8}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-2xs group-hover:scale-110 transition">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>

              {/* Block 4: Pastel Mint (Token Consumption - Visible on Dashboard) */}
              <Link
                href="/analytics/usage#tokens"
                className="p-5 rounded-[26px] bg-[#D7EFEA] hover:shadow-md transition flex flex-col justify-between min-h-[125px] group border border-teal-200/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-teal-800" />
                    <span>Tokens</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-teal-900 shadow-2xs">
                    OpenAI
                  </span>
                </div>
                <div className="flex items-end justify-between mt-2">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
                      {tokenConsumption?.tokenBased?.[0]?.utilizationPercentage || 77}% Used
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium block mt-0.5">
                      38.5M of 50M • ₹23k idle
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-2xs group-hover:scale-110 transition shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* SECTION 3: Wide Pastel Lemon Card (Monthly vs Yearly License Optimization) */}
          <Link
            href="/recommendations"
            className="p-6 rounded-[30px] bg-[#FEF1C9] hover:shadow-lg transition-all duration-200 block group relative"
          >
            {/* Top row: Category tag & circular arrow */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  IT & Software Governance
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-slate-700 uppercase">
                  {financialView === 'yearly' ? 'Yearly View' : 'Monthly View'}
                </span>
              </div>

              <div className="w-9 h-9 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-xs group-hover:scale-110 transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Title & subtitle based on Monthly vs Yearly mode */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {financialView === 'yearly'
                  ? `2026 Fiscal Year • YoY Recovery +${yearlyRecovery?.yoyImprovement?.totalRecoveryPointsImprovement || 10.3}% pts`
                  : `${analytics?.activeLicenses || 140} active of ${analytics?.totalLicenses || 185} seats`}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {financialView === 'yearly'
                  ? 'Yearly Investment & Recovery Intelligence'
                  : 'Monthly Subscription Optimization'}
              </h3>
            </div>

            {/* Dual Spend Progress Bar */}
            <div className="mt-4">
              <div className="w-full h-2.5 rounded-full bg-amber-200/80 overflow-hidden flex">
                <div
                  className="bg-[#0F172A] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      financialView === 'yearly'
                        ? yearlyRecovery?.latestYear?.recoveryPercentage || 75.3
                        : analytics?.overallUtilization || 76
                    }%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold mt-2 text-slate-700">
                {financialView === 'yearly' ? (
                  <>
                    <span>Recovered: {formatINR(yearlyRecovery?.latestYear?.realizedValue || 965984)} ({yearlyRecovery?.latestYear?.recoveryPercentage || 75.3}%)</span>
                    <span className="text-amber-800 font-bold">Unrecovered: {formatINR(yearlyRecovery?.latestYear?.unrecoveredCost || 317116)}</span>
                  </>
                ) : (
                  <>
                    <span>Active: {formatINR((analytics?.totalMonthlyCost || 320000) - (analytics?.unusedMonthlyCost || 75000))}</span>
                    <span className="text-amber-800 font-bold">Reclaimable: {formatINR(analytics?.unusedMonthlyCost || 75000)} / mo</span>
                  </>
                )}
              </div>
            </div>
          </Link>

          {/* SECTION 4: Department Spend Distribution Chart */}
          <div className="p-6 rounded-[30px] bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Spend by Department
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {financialView === 'yearly' ? 'Yearly Software Expenditure' : 'Monthly Software Expenditure'}
                </h3>
              </div>
              <Link
                href="/analytics/costs"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} barSize={26}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10 }}
                    tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-700">
                            <p className="font-bold">{data.fullName} ({data.name})</p>
                            <p className="text-cyan-300 mt-1">Spend: {formatINR(data.spend)} / mo</p>
                            <p className="text-slate-300">Budget: {formatINR(data.budget)} / mo</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="spend" radius={[10, 10, 10, 10]}>
                    {departmentData.map((_: any, index: number) => {
                      const colors = ['#0F172A', '#6C5CE7', '#62D0DF', '#FF8C68', '#F59E0B'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Renewal Schedule Calendar & Upcoming Pills */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Renewal schedule
            </h2>
            <Link
              href="/renewals"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Calendar Card (Matching media_1791173942344.jpg) */}
          <div className="p-6 rounded-[32px] bg-white shadow-sm border border-slate-100">
            
            {/* Month Header with < > buttons */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">
                {monthNames[month]} {year}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 text-center mb-3">
              {['MON', 'THU', 'WED', 'TUE', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-400 tracking-wider">
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {/* Previous month trailing days */}
              <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 font-medium">
                30
              </div>

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelectedActive = activeRenewalDays.includes(dayNum);

                return (
                  <div key={dayNum} className="flex items-center justify-center">
                    {isSelectedActive ? (
                      <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shadow-md">
                        {dayNum}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 font-medium cursor-pointer transition">
                        {dayNum}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Next month leading days */}
              <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 font-medium">
                1
              </div>
              <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full text-slate-300 font-medium">
                2
              </div>
              <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 font-medium">
                3
              </div>
            </div>

          </div>

          {/* Upcoming Renewal Pills List (Matching media_1791173942344.jpg) */}
          <div className="space-y-3 pt-2">
            
            {/* Renewal Item 1: Pastel Mint */}
            <Link
              href="/renewals"
              className="p-4 rounded-2xl bg-[#D7EFEA] hover:shadow-md transition flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  Adobe Creative Cloud — Annual Contract
                </h4>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  Due in 18 days • 15 idle seats flagged
                </p>
              </div>
            </Link>

            {/* Renewal Item 2: Pastel Mint */}
            <Link
              href="/renewals"
              className="p-4 rounded-2xl bg-[#D7EFEA] hover:shadow-md transition flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  Slack Enterprise Grid — Q4 License Review
                </h4>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  Due in 32 days • 45 active seats
                </p>
              </div>
            </Link>

            {/* Renewal Item 3: Pastel Mint */}
            <Link
              href="/renewals"
              className="p-4 rounded-2xl bg-[#D7EFEA] hover:shadow-md transition flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  GitHub Enterprise — CoPilot Add-on Audit
                </h4>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  Due in 45 days • 95% utilization
                </p>
              </div>
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}
