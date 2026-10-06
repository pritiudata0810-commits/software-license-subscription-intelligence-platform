'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Building2,
  KeyRound,
  UserCheck,
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  CalendarClock,
  AlertTriangle,
  Lightbulb,
  Compass,
  FileCheck2,
  FileText,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('ADMIN' | 'MANAGER' | 'EMPLOYEE')[];
  badge?: string | number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Software', href: '/software', icon: Layers },
    { label: 'Vendors', href: '/vendors', icon: Building2 },
    { label: 'Licenses', href: '/licenses', icon: KeyRound },
    { label: 'Assignments', href: '/assignments', icon: UserCheck, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Employees', href: '/employees', icon: Users, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Departments', href: '/departments', icon: Briefcase, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Usage Analytics', href: '/analytics/usage', icon: TrendingUp },
    { label: 'Cost Analysis', href: '/analytics/costs', icon: DollarSign },
    { label: 'Renewals', href: '/renewals', icon: CalendarClock },
    { label: 'Risk Alerts', href: '/risk-alerts', icon: AlertTriangle },
    { label: 'Recommendations', href: '/recommendations', icon: Lightbulb },
    { label: 'Requests', href: '/requests', icon: Compass },
    { label: 'Approvals', href: '/approvals', icon: FileCheck2, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Audit Logs', href: '/audit-logs', icon: History, roles: ['ADMIN'] },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const visibleItems = navItems.filter(item => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 rounded-full bg-slate-900 text-white shadow-lg"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          flex flex-col justify-between py-6 px-3 bg-white/95 lg:bg-transparent
          border-r border-slate-100 lg:border-none transition-all duration-300
          ${mobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${expanded ? 'lg:w-60' : 'lg:w-20'}
        `}
      >
        {/* Top: Minimalist Dark Logo mark matching media_1791173942344.jpg */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full px-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group"
              title="LicenseIQ Platform"
            >
              {/* Circular dark logo mark matching reference image */}
              <div className="w-11 h-11 rounded-[18px] bg-[#0F172A] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition">
                <span className="bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">L</span>
              </div>
              {expanded && (
                <div className="flex flex-col animate-in fade-in duration-200">
                  <span className="font-bold text-slate-900 text-base tracking-tight">LicenseIQ</span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Enterprise</span>
                </div>
              )}
            </Link>

            {/* Expand / Collapse toggle for desktop */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="hidden lg:flex w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 items-center justify-center transition"
              title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items Rail */}
          <nav className="w-full mt-8 flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-230px)] no-scrollbar pr-0.5">
            {visibleItems.map(item => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={!expanded ? item.label : undefined}
                  className={`
                    flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs font-semibold transition-all group relative
                    ${
                      active
                        ? 'bg-[#0F172A] text-white shadow-md shadow-slate-900/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                    }
                    ${!expanded ? 'justify-center' : ''}
                  `}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-slate-800'
                    }`}
                  />

                  {expanded && (
                    <span className="truncate text-xs font-medium tracking-tight animate-in fade-in duration-150">
                      {item.label}
                    </span>
                  )}

                  {/* Active Indicator dot when collapsed */}
                  {!expanded && active && (
                    <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Settings & Logout */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-slate-100 w-full px-2">
          <button
            onClick={() => logout()}
            className={`
              flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition group
              ${!expanded ? 'justify-center' : ''}
            `}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-6 transition-transform" />
            {expanded && (
              <span className="text-xs font-medium tracking-tight animate-in fade-in duration-150">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
