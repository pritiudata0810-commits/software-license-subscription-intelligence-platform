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
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  CalendarClock,
  AlertTriangle,
  Lightbulb,
  FileCheck2,
  FileText,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  User,
  Compass,
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

interface NavSection {
  title?: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'SOFTWARE',
      items: [
        { label: 'Software', href: '/software', icon: Layers },
        { label: 'Vendors', href: '/vendors', icon: Building2 },
        { label: 'Licenses', href: '/licenses', icon: KeyRound },
        { label: 'Assignments', href: '/assignments', icon: UserCheck, roles: ['ADMIN', 'MANAGER'] },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        { label: 'Employees', href: '/employees', icon: Users, roles: ['ADMIN', 'MANAGER'] },
        { label: 'Departments', href: '/departments', icon: Briefcase, roles: ['ADMIN', 'MANAGER'] },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'Usage Analytics', href: '/analytics/usage', icon: TrendingUp },
        { label: 'Cost Analysis', href: '/analytics/costs', icon: DollarSign },
        { label: 'Renewals', href: '/renewals', icon: CalendarClock },
        { label: 'Risk & Alerts', href: '/risk-alerts', icon: AlertTriangle },
        { label: 'Recommendations', href: '/recommendations', icon: Lightbulb },
      ],
    },
    {
      title: 'WORKFLOW',
      items: [
        { label: 'Software Requests', href: '/requests', icon: Compass },
        { label: 'Approvals', href: '/approvals', icon: FileCheck2, roles: ['ADMIN', 'MANAGER'] },
      ],
    },
    {
      title: 'REPORTING',
      items: [
        { label: 'Reports', href: '/reports', icon: FileText },
        { label: 'Audit Logs', href: '/audit-logs', icon: History, roles: ['ADMIN'] },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { label: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const roleColor = {
    ADMIN: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    MANAGER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    EMPLOYEE: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  }[user?.role || 'EMPLOYEE'];

  const navContent = (
    <div className="flex flex-col h-full bg-[#0B192C] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-wide text-sm leading-tight">LicenseIQ</span>
              <span className="text-[10px] text-sky-400 font-medium tracking-wider uppercase">Enterprise Intelligence</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, sIdx) => {
          // Filter items by role
          const visibleItems = section.items.filter((item) => {
            if (!item.roles) return true;
            return user ? item.roles.includes(user.role) : false;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              {!collapsed && section.title && (
                <div className="px-3 text-[11px] font-semibold text-slate-500 tracking-wider">
                  {section.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Profile & Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        {!collapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs border border-slate-600">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{user?.name || 'Guest User'}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase tracking-wider ${roleColor}`}>
                    {user?.role || 'VIEWER'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-semibold text-xs border border-slate-600">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0B192C] text-white flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-wide">LicenseIQ</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
          <div className="w-72 h-full bg-[#0B192C] shadow-2xl animate-in slide-in-from-left">
            {navContent}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
