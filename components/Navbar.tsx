'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Search,
  Activity,
  UserCheck,
  Shield,
  Briefcase,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, quickLoginAs } = useAuth();
  const [alertsCount, setAlertsCount] = useState(0);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function loadNavbarData() {
      try {
        const [alertsRes, healthRes] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/analytics/health'),
        ]);

        if (alertsRes.ok) {
          const aData = await alertsRes.json();
          if (aData.success) {
            setAlertsCount(aData.criticalCount + aData.warningCount);
            setRecentAlerts(aData.alerts?.slice(0, 4) || []);
          }
        }

        if (healthRes.ok) {
          const hData = await healthRes.json();
          if (hData.success) {
            setHealthScore(hData.health?.totalScore || null);
          }
        }
      } catch (e) {
        console.error('Navbar data fetch error:', e);
      }
    }

    loadNavbarData();
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between shadow-sm">
      {/* Search Input */}
      <div className="flex items-center gap-3 w-72 md:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search software, vendors, licenses..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Controls: Quick Role Switcher + Health Score + Alerts */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick Role Switcher Bar */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" /> Switch Role:
          </span>
          <button
            onClick={() => quickLoginAs('ADMIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => quickLoginAs('MANAGER')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'MANAGER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Manager
          </button>
          <button
            onClick={() => quickLoginAs('EMPLOYEE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              user?.role === 'EMPLOYEE'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Employee
          </button>
        </div>

        {/* License Health Score Pill */}
        {healthScore !== null && (
          <Link
            href="/recommendations"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">Health Score:</span>
              <span
                className={`font-bold ${
                  healthScore >= 80
                    ? 'text-emerald-600'
                    : healthScore >= 60
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {healthScore}/100
              </span>
            </div>
          </Link>
        )}

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {alertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Alert Dropdown */}
          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> System Alerts
                </span>
                <Link
                  href="/risk-alerts"
                  onClick={() => setShowAlertMenu(false)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/80 transition"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="truncate">{alert.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{alert.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">No active alerts</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
