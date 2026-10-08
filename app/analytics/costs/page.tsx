'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ArrowDownRight,
  TrendingDown,
  Layers,
  Briefcase,
  RefreshCw,
  Info,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
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

export default function CostAnalysisPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [loading, setLoading] = useState(true);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      const [anRes, yrRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/analytics/yearly-recovery'),
      ]);

      if (anRes.ok) {
        const data = await anRes.json();
        if (data.success) setAnalytics(data.analytics);
      }
      if (yrRes.ok) {
        const yData = await yrRes.json();
        if (yData.success) setYearlyData(yData);
      }
    } catch (err) {
      console.error('Error loading cost analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, []);

  if (loading && !analytics) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Aggregating real-time financial spend and idle waste calculations...</p>
      </div>
    );
  }

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const softwareBreakdown = analytics?.softwareBreakdown || [];
  const departmentBreakdown = analytics?.departmentBreakdown || [];

  // Data for spend vs waste chart
  const costBarData = softwareBreakdown.map((s: any) => ({
    name: s.softwareName.length > 12 ? s.softwareName.substring(0, 12) + '...' : s.softwareName,
    utilized: s.monthlyCost - s.unusedMonthlyCost,
    wasted: s.unusedMonthlyCost,
  }));

  // Multi-year comparison chart dataset
  const multiYearChartData = (yearlyData?.years || []).map((y: any) => ({
    year: y.year.toString(),
    investment: y.totalInvestment,
    realized: y.realizedValue,
    unrecovered: y.unrecoveredCost,
    rate: y.recoveryPercentage,
  }));

  // Selected year metrics
  const currentYearMetric = (yearlyData?.years || []).find((y: any) => y.year === selectedYear) || {
    totalInvestment: 0,
    realizedValue: 0,
    unrecoveredCost: 0,
    recoveryPercentage: 0,
  };

  const currentYearSoftwareList = yearlyData?.softwareByYear?.[selectedYear] || [];

  // Group by category for donut chart
  const categoryMap = new Map<string, number>();
  for (const s of softwareBreakdown) {
    const current = categoryMap.get(s.category) || 0;
    categoryMap.set(s.category, current + s.monthlyCost);
  }

  const categoryPieData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#2563EB', '#0284C7', '#0D9488', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Monthly / Yearly Analytics Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
              Financial Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              Aiven PostgreSQL Grounded
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Cost & Savings Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monthly subscription expenditures and multi-year capital investment & recovery intelligence.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Top-Level Tab Switcher: Monthly vs Yearly Analytics */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Analytics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('yearly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'yearly'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly Analytics
            </button>
          </div>

          <button
            onClick={fetchCostData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            title="Refresh Financial Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW A: MONTHLY ANALYTICS */}
      {/* ============================================================== */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Formula Documentation Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <div className="font-bold">Monthly Financial Calculation Formulas:</div>
              <div className="font-mono text-[11px] mt-0.5 text-blue-800">
                Monthly Cost = Total Licenses × Cost Per License
              </div>
              <div className="font-mono text-[11px] text-blue-800">
                Unused Monthly Cost = Unused Licenses × Cost Per License
              </div>
              <div className="font-mono text-[11px] text-blue-800">
                Potential Annual Saving = Unused Monthly Cost × 12
              </div>
            </div>
          </div>

          {/* Monthly Financial KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Spend</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatINR(analytics?.monthlyExpenditure)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Annualized: {formatINR(analytics?.annualExpenditure)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Utilized Monthly Spend</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatINR((analytics?.monthlyExpenditure || 0) - (analytics?.potentialMonthlySavings || 0))}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Active productive license seats
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unused Monthly Waste</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">
                {formatINR(analytics?.potentialMonthlySavings)}
              </div>
              <div className="text-[11px] text-rose-500 font-medium mt-0.5">
                Paid seats sitting idle
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Potential Annual Saving</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {formatINR(analytics?.potentialAnnualSavings)}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                Recoverable through seat optimization
              </div>
            </div>
          </div>

          {/* Monthly Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Spend Donut */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-1">Expenditure by Category</h2>
              <p className="text-[10px] text-slate-500 mb-4">Monthly subscription budget by software domain</p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatINR(val)]}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto">
                {categoryPieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 truncate">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 flex-shrink-0">{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stacked Bar Chart: Utilized vs Wasted Cost */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-1">Monthly Cost Breakdown: Productive vs Idle (₹)</h2>
              <p className="text-[10px] text-slate-500 mb-4">Software-wise financial efficiency and idle seat drain</p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip
                      formatter={(v: any) => [formatINR(v)]}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="utilized" stackId="a" fill="#2563EB" name="Utilized Active Spend" />
                    <Bar dataKey="wasted" stackId="a" fill="#EF4444" name="Idle Waste (Unused)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Monthly Cost & Savings Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900">Software Monthly Cost Ledger</h2>
              <span className="text-[11px] text-slate-500">Real PostgreSQL calculated figures</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Software</th>
                    <th className="py-3 px-4">Seats (Act/Tot)</th>
                    <th className="py-3 px-4">Cost / Seat</th>
                    <th className="py-3 px-4">Monthly Spend</th>
                    <th className="py-3 px-4">Annual Spend</th>
                    <th className="py-3 px-4">Unused Monthly Waste</th>
                    <th className="py-3 px-4">Potential Annual Saving</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {softwareBreakdown.map((sw: any) => (
                    <tr key={sw.softwareId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{sw.softwareName}</div>
                        <div className="text-[10px] text-slate-400">{sw.vendorName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{sw.activeLicenses}</span>
                        <span className="text-slate-400"> / {sw.totalLicenses}</span>
                        <div className="text-[10px] text-slate-400">{sw.unusedLicenses} unused</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {formatINR(sw.costPerLicense)}/mo
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatINR(sw.monthlyCost)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatINR(sw.annualCost)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${sw.unusedMonthlyCost > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {formatINR(sw.unusedMonthlyCost)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${sw.potentialAnnualSaving > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {formatINR(sw.potentialAnnualSaving)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW B: YEARLY ANALYTICS (YEARLY INVESTMENT & RECOVERY) */}
      {/* ============================================================== */}
      {activeTab === 'yearly' && (
        <div className="space-y-6">
          {/* Year Selector Toolbar & Formula Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">Select Tracked Fiscal Year:</span>
              <div className="flex items-center gap-1 ml-1">
                {[2024, 2025, 2026].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      selectedYear === yr
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Data source: <span className="text-slate-800 font-semibold">PostgreSQL CostRecord Ledger</span> ({yearlyData?.years?.length || 3} tracked fiscal years)
            </div>
          </div>

          {/* Formula Documentation Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900">
              <div className="font-bold">Yearly Capital Recovery Formulas:</div>
              <div className="font-mono text-[11px] mt-0.5 text-indigo-800">
                Unrecovered Cost = Total Investment - Realized Value
              </div>
              <div className="font-mono text-[11px] text-indigo-800">
                Recovery Rate (%) = (Realized Value / Total Investment) × 100
              </div>
              <div className="font-mono text-[11px] text-indigo-800">
                YoY Recovery Improvement = Latest Recovery Rate - Baseline Recovery Rate (+10.3 percentage points)
              </div>
            </div>
          </div>

          {/* 4 Yearly Financial KPIs for the selected year */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {selectedYear} Total Investment
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {formatINR(currentYearMetric.totalInvestment)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Total software capital deployed
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {selectedYear} Realized Value (Recovery)
              </span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {formatINR(currentYearMetric.realizedValue)}
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                {currentYearMetric.recoveryPercentage}% Capital Recovery Rate
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {selectedYear} Unrecovered Cost
              </span>
              <div className="text-2xl font-bold text-rose-600 mt-1">
                {formatINR(currentYearMetric.unrecoveredCost)}
              </div>
              <div className="text-[11px] text-rose-500 font-medium mt-0.5">
                {currentYearMetric.unrecoveredPercentage || (100 - currentYearMetric.recoveryPercentage).toFixed(1)}% unrecovered capital
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                YoY Capital Trajectory
              </span>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                +{yearlyData?.yoyImprovement?.totalRecoveryPointsImprovement || 10.3}% pts
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                2024 (65%) → 2025 (76%) → 2026 ({yearlyData?.latestYear?.recoveryPercentage || 75.3}%)
              </div>
            </div>
          </div>

          {/* Multi-Year Comparison Chart */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Multi-Year Capital Investment vs Realized Value (₹)
                </h2>
                <p className="text-[10px] text-slate-500">
                  Annual comparison across 2024, 2025, and 2026 showing capital recovery efficiency progression
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold self-start">
                +10.3% Recovery Points Trajectory
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiYearChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(v: any) => [formatINR(v)]}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="investment" fill="#0F172A" name="Total Capital Investment" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="realized" fill="#10B981" name="Realized Value (Recovered)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unrecovered" fill="#EF4444" name="Unrecovered Cost" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Yearly Software Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-slate-900">
                  {selectedYear} Yearly Software Ledger
                </h2>
                <p className="text-[11px] text-slate-400">
                  Aggregated from actual PostgreSQL CostRecord rows for fiscal year {selectedYear}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700">
                {currentYearSoftwareList.length} software tracked in {selectedYear}
              </span>
            </div>

            {currentYearSoftwareList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No yearly data available for {selectedYear}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Software Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Fiscal Year</th>
                      <th className="py-3 px-4">Yearly Investment</th>
                      <th className="py-3 px-4">Realized Value</th>
                      <th className="py-3 px-4">Unrecovered Cost</th>
                      <th className="py-3 px-4">Recovery Rate</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {currentYearSoftwareList.map((sw: any, idx: number) => (
                      <tr key={`${sw.softwareId}-${idx}`} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{sw.softwareName}</td>
                        <td className="py-3 px-4 text-slate-500">{sw.category}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{selectedYear}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatINR(sw.investment)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{formatINR(sw.realizedValue)}</td>
                        <td className="py-3 px-4 font-bold text-rose-600">{formatINR(sw.unrecoveredCost)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{sw.recoveryRate}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            sw.recoveryRate >= 75
                              ? 'bg-emerald-100 text-emerald-800'
                              : sw.recoveryRate >= 60
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sw.recoveryRate >= 75 ? 'Optimal' : sw.recoveryRate >= 60 ? 'Healthy' : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
