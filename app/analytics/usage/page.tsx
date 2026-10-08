'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RefreshCw,
  Info,
  ChevronRight,
  Cpu,
  Zap,
  Coins,
  Users,
  Sparkles,
  Calendar,
  ArrowUpRight,
  Activity,
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

export default function UsageAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [consumption, setConsumption] = useState<any>(null);
  const [consumptionView, setConsumptionView] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [consumptionLoading, setConsumptionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(70);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumption = async (yr: number = selectedYear) => {
    setConsumptionLoading(true);
    try {
      const res = await fetch(`/api/analytics/consumption?year=${yr}`);
      const data = await res.json();
      if (data.success) setConsumption(data);
    } catch (err) {
      console.error('Error loading consumption analytics:', err);
    } finally {
      setConsumptionLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchConsumption(selectedYear);
  }, []);

  const handleYearChange = (yr: number) => {
    setSelectedYear(yr);
    fetchConsumption(yr);
  };

  if (loading && !analytics) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Computing software utilization metrics...</p>
      </div>
    );
  }

  const softwareBreakdown = analytics?.softwareBreakdown || [];

  // Group by classification
  const classificationCounts = {
    EXCELLENT: softwareBreakdown.filter((s: any) => s.utilizationRate >= 90).length,
    GOOD: softwareBreakdown.filter((s: any) => s.utilizationRate >= 75 && s.utilizationRate < 90).length,
    MODERATE: softwareBreakdown.filter((s: any) => s.utilizationRate >= 50 && s.utilizationRate < 75).length,
    LOW: softwareBreakdown.filter((s: any) => s.utilizationRate >= 25 && s.utilizationRate < 50).length,
    CRITICAL: softwareBreakdown.filter((s: any) => s.utilizationRate < 25).length,
  };

  const pieData = [
    { name: 'Excellent (≥90%)', value: classificationCounts.EXCELLENT, color: '#10B981' },
    { name: 'Good (75-89%)', value: classificationCounts.GOOD, color: '#3B82F6' },
    { name: 'Moderate (50-74%)', value: classificationCounts.MODERATE, color: '#F59E0B' },
    { name: 'Low (25-49%)', value: classificationCounts.LOW, color: '#F97316' },
    { name: 'Critical (<25%)', value: classificationCounts.CRITICAL, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  const underutilizedAtThreshold = softwareBreakdown.filter((s: any) => s.utilizationRate < threshold);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Usage & Utilization Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mathematical license utilization formulas, efficiency tiers, and idle seat diagnostics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Recalculate</span>
        </button>
      </div>

      {/* Formula Documentation Card */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900">
          <div className="font-bold">Utilization Formula:</div>
          <div className="font-mono text-[11px] mt-0.5 text-blue-800">
            Utilization (%) = (Active Licenses / Total Licenses) × 100
          </div>
          <div className="text-[10px] text-blue-700 mt-1">
            Classifications: Excellent (≥90%) • Good (75–89%) • Moderate (50–74%) • Low (25–49%) • Critical (&lt;25%)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overall Platform Utilization</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {analytics?.overallUtilization || 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {analytics?.activeLicenses || 0} active / {analytics?.totalLicenses || 0} total seats
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available (Idle) Capacity</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {analytics?.availableLicenses || 0} Seats
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Ready for instant employee assignment
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Underutilized Products</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {underutilizedAtThreshold.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Below configured {threshold}% threshold
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Configurable Threshold</span>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min="30"
              max="90"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <span className="text-sm font-bold text-blue-600">{threshold}%</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Drag slider to adjust low benchmark</div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Efficiency Tier Distribution</h2>
          <p className="text-[10px] text-slate-500 mb-4">Proportion of software portfolio by utilization tier</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: string) => [`${val} software product(s)`, name]}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart comparing Active vs Unused across catalog */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Active vs Unused Seat Allocation</h2>
            <p className="text-[10px] text-slate-500 mb-4">Detailed seat distribution across all managed software</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={softwareBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="softwareName" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #E2E8F0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="activeLicenses" fill="#2563EB" name="Active Seats" stackId="a" />
                  <Bar dataKey="unusedLicenses" fill="#CBD5E1" name="Unused Seats" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Software Utilization Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-900">Software Utilization Breakdown</h2>
          <span className="text-[11px] text-slate-500">{softwareBreakdown.length} software entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Software</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Active</th>
                <th className="py-3 px-4">Unused</th>
                <th className="py-3 px-4">Utilization Rate</th>
                <th className="py-3 px-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {softwareBreakdown.map((sw: any) => (
                <tr key={sw.softwareId} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{sw.softwareName}</td>
                  <td className="py-3 px-4 text-slate-500">{sw.category}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{sw.totalLicenses}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600">{sw.activeLicenses}</td>
                  <td className="py-3 px-4 font-semibold text-rose-500">{sw.unusedLicenses}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sw.utilizationRate >= 75 ? 'bg-emerald-500' : sw.utilizationRate >= 50 ? 'bg-blue-600' : 'bg-rose-500'
                          }`}
                          style={{ width: `${sw.utilizationRate}%` }}
                        />
                      </div>
                      <span className="font-bold">{sw.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        sw.classification === 'EXCELLENT'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sw.classification === 'GOOD'
                          ? 'bg-blue-100 text-blue-700'
                          : sw.classification === 'MODERATE'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {sw.classification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION: LICENSE & TOKEN CONSUMPTION INTELLIGENCE (NEW VISIBLE UI) */}
      {/* ============================================================== */}
      <div id="tokens" className="space-y-6 pt-6 border-t border-slate-200/60">
        
        {/* Section Header with Monthly / Yearly Toggle & Year Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span>AI & API Quota Intelligence</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                PostgreSQL Grounded
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              <span>License & Token Consumption</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise LLM quotas, consumed tokens, remaining headroom, financial impact, and employee consumption audit.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Monthly / Yearly Toggle Switch */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center shadow-inner">
              <button
                type="button"
                onClick={() => setConsumptionView('monthly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  consumptionView === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setConsumptionView('yearly')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  consumptionView === 'yearly'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Year Selector Pills (Visible when Yearly is active) */}
            {consumptionView === 'yearly' && (
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
                {[2024, 2025, 2026].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleYearChange(yr)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                      selectedYear === yr
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => fetchConsumption(selectedYear)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs shadow-2xs transition"
              title="Refresh Token Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${consumptionLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {consumptionLoading && (
          <div className="p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Querying PostgreSQL token consumption and employee quotas...</p>
          </div>
        )}

        {/* Empty State when no token data exists for selected period */}
        {!consumptionLoading && (!consumption?.tokenBased || consumption.tokenBased.length === 0) && (
          <div className="p-10 rounded-3xl bg-white border border-dashed border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No token-based software usage data available for {consumptionView === 'yearly' ? selectedYear : 'current month'}.
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Token tracking was provisioned for 2026. Select 2026 in the year picker to review active enterprise AI token consumption.
            </p>
            {consumptionView === 'yearly' && selectedYear !== 2026 && (
              <button
                type="button"
                onClick={() => handleYearChange(2026)}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Switch to Active Year (2026)
              </button>
            )}
          </div>
        )}

        {/* Token Products Cards & Tables */}
        {!consumptionLoading && consumption?.tokenBased?.map((tk: any) => {
          // Select dataset according to Monthly vs Yearly view
          const activeData = consumptionView === 'monthly' && tk.monthly ? tk.monthly : (tk.yearly || tk);
          const allocated = activeData.allocatedTokens || tk.allocatedTokens;
          const used = activeData.usedTokens || tk.usedTokens;
          const remaining = Math.max(0, allocated - used);
          const utilRate = activeData.utilizationPercentage || tk.utilizationPercentage;
          const totalCost = activeData.totalCost || tk.totalCost;
          const usedCost = activeData.usedCost || tk.usedCost;
          const unusedCost = activeData.unusedCapacityCost || tk.unusedCapacityCost;
          const status = activeData.status || tk.status;
          const employees = activeData.employeeUsage || tk.employeeUsage || [];

          return (
            <div key={tk.softwareId} className="space-y-6">
              
              {/* Product Header Card with Pastel Tone & Status */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 border border-indigo-100/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">
                          {tk.softwareName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                          TOKEN_BASED
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {tk.vendorName} • {tk.category} • Unit Rate: ₹{tk.tokenUnitCost}/token
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                      status === 'Near Limit'
                        ? 'bg-rose-100 text-rose-800'
                        : status === 'High Usage'
                        ? 'bg-amber-100 text-amber-800'
                        : status === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      <Activity className="w-3.5 h-3.5" />
                      <span>{utilRate}% → {status}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({consumptionView === 'yearly' ? `${selectedYear} Annual Quota` : 'Current Month'})
                    </span>
                  </div>
                </div>

                {/* 4 Financial & Token KPI Blocks */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  
                  {/* Block 1: Allocated */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Allocated Tokens
                    </span>
                    <div className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                      {allocated >= 1000000 ? `${(allocated / 1000000).toFixed(1)}M` : allocated.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {allocated.toLocaleString()} tokens
                    </div>
                  </div>

                  {/* Block 2: Used */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Used Tokens
                    </span>
                    <div className="text-xl md:text-2xl font-black text-indigo-600 mt-1">
                      {used >= 1000000 ? `${(used / 1000000).toFixed(1)}M` : used.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-indigo-700 font-medium mt-0.5">
                      {utilRate}% consumed
                    </div>
                  </div>

                  {/* Block 3: Remaining */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Remaining Tokens
                    </span>
                    <div className="text-xl md:text-2xl font-black text-emerald-600 mt-1">
                      {remaining >= 1000000 ? `${(remaining / 1000000).toFixed(1)}M` : remaining.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      {remaining.toLocaleString()} reserve
                    </div>
                  </div>

                  {/* Block 4: Financial Cost */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Financial Impact
                    </span>
                    <div className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                      ₹{usedCost.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Total: ₹{totalCost.toLocaleString('en-IN')} • Waste: <span className="text-amber-700 font-bold">₹{unusedCost.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                </div>

                {/* Visual Utilization Progress Bar */}
                <div className="mt-6 p-4 rounded-2xl bg-white/80 border border-indigo-100">
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <span className="text-slate-800">Used: {used.toLocaleString()} ({utilRate}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-slate-800">Remaining: {remaining.toLocaleString()} ({Math.max(0, 100 - utilRate).toFixed(1)}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${Math.min(100, utilRate)}%` }}
                    />
                    <div
                      className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${Math.max(0, 100 - utilRate)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                    <span>0 Tokens</span>
                    <span className="font-semibold text-slate-600">{tk.statusExplanation}</span>
                    <span>{allocated.toLocaleString()} Tokens Max</span>
                  </div>
                </div>

              </div>

              {/* Employee Token Consumption Ledger Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Employee Token Consumption</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Direct individual consumption records extracted from PostgreSQL usage ledger
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    {employees.length} Tracked Employees
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Allocated</th>
                        <th className="py-3 px-4">Used</th>
                        <th className="py-3 px-4">Remaining</th>
                        <th className="py-3 px-4">Utilization</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {employees.map((emp: any) => (
                        <tr key={emp.userId} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{emp.name}</div>
                            <div className="text-[11px] text-slate-400">{emp.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{emp.department}</div>
                            {emp.designation && (
                              <div className="text-[10px] text-slate-400">{emp.designation}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {emp.allocatedTokens >= 1000000
                              ? `${(emp.allocatedTokens / 1000000).toFixed(1)}M`
                              : emp.allocatedTokens.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-bold text-indigo-600">
                            {emp.usedTokens >= 1000000
                              ? `${(emp.usedTokens / 1000000).toFixed(1)}M`
                              : emp.usedTokens.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-emerald-600">
                            {emp.remainingTokens >= 1000000
                              ? `${(emp.remainingTokens / 1000000).toFixed(1)}M`
                              : emp.remainingTokens.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    emp.utilizationPercentage >= 96
                                      ? 'bg-rose-500'
                                      : emp.utilizationPercentage >= 81
                                      ? 'bg-amber-500'
                                      : emp.utilizationPercentage >= 41
                                      ? 'bg-emerald-500'
                                      : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${Math.min(100, emp.utilizationPercentage)}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-900">{emp.utilizationPercentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              emp.status === 'Near Limit'
                                ? 'bg-rose-100 text-rose-800'
                                : emp.status === 'High Usage'
                                ? 'bg-amber-100 text-amber-800'
                                : emp.status === 'Healthy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
