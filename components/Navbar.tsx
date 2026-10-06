'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Search,
  AlertTriangle,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [alertsCount, setAlertsCount] = useState(0);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const alertsRes = await fetch('/api/alerts');
        if (alertsRes.ok) {
          const aData = await alertsRes.json();
          if (aData.success) {
            setAlertsCount(aData.criticalCount + aData.warningCount);
            setRecentAlerts(aData.alerts?.slice(0, 4) || []);
          }
        }
      } catch (e) {
        console.error('Navbar alerts fetch error:', e);
      }
    }
    loadAlerts();
  }, []);

  // Title formatting based on route
  const getPageTitle = () => {
    if (pathname === '/dashboard') {
      return (
        <div className="flex items-center gap-2">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <span className="text-2xl lg:text-3xl animate-wave origin-bottom-right inline-block">👋</span>
        </div>
      );
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const mainTitle = segments[segments.length - 1]
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return (
      <div className="flex flex-col">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
          {mainTitle}
        </h1>
        <span className="text-xs text-slate-400 font-medium">
          LicenseIQ Platform / {mainTitle}
        </span>
      </div>
    );
  };

  const getRoleBadgeClass = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MANAGER':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'EMPLOYEE':
      default:
        return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'LQ';

  return (
    <header className="h-20 bg-transparent px-4 sm:px-8 flex items-center justify-between z-20 shrink-0">
      {/* Left: Dynamic Greeting or Page Title */}
      <div className="flex items-center">
        {getPageTitle()}
      </div>

      {/* Right Controls: Pill Search Bar + Alerts Bell + Profile Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Pill Search Bar matching media_1791173942344.jpg */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search software, vendors, licenses..."
            className="w-64 lg:w-80 pl-11 pr-4 py-2.5 text-xs rounded-full bg-[#F4F6F6] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all border border-transparent focus:border-slate-200"
          />
        </div>

        {/* Alerts Bell with Notification Count */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="w-10 h-10 rounded-full bg-[#F4F6F6] hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition relative"
            title="System Alerts & Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {alertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Alert Dropdown */}
          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Live Risk Alerts
                </span>
                <Link
                  href="/risk-alerts"
                  onClick={() => setShowAlertMenu(false)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-[#F8FAFA] text-xs hover:bg-slate-100 transition"
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
                  <div className="py-6 text-center text-xs text-slate-400">All systems optimal • No critical alerts</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-200 via-amber-200 to-teal-200 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-slate-800">
                {userInitials}
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user?.role || 'EMPLOYEE'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="pb-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getRoleBadgeClass()}`}>
                    {user?.role}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {user?.department?.name || 'Enterprise'}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
