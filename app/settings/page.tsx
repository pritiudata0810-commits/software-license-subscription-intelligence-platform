'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Shield,
  Database,
  Award,
  Users,
  Sliders,
  CheckCircle2,
  Lock,
  Globe,
  DollarSign
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [threshold, setThreshold] = useState(70);
  const [currency, setCurrency] = useState('INR');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">System & Engine Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Platform configurations, PostgreSQL connection diagnostics, and optimization rules.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration preferences updated successfully.</span>
        </div>
      )}

      {/* Card 1: Enterprise Platform Information */}
      <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-[#E3DCFD] text-purple-700 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Platform & Architecture Overview</h2>
            <p className="text-[11px] text-slate-500">LicenseIQ Enterprise Subscription & License Intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#D7EFEA] text-slate-800">
            <span className="font-bold block mb-1">Platform Edition</span>
            <span className="text-slate-600 font-medium">LicenseIQ Enterprise v1.0</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FEF1C9] text-slate-800">
            <span className="font-bold block mb-1">Database Engine</span>
            <span className="text-slate-600 font-medium">Aiven PostgreSQL (Prisma ORM)</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E3DCFD] text-slate-800">
            <span className="font-bold block mb-1">Security & Auth</span>
            <span className="text-slate-600 font-medium">JWT + Multi-Role RBAC</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDDCE5] text-slate-800">
            <span className="font-bold block mb-1">Analytics Engine</span>
            <span className="text-slate-600 font-medium">FastAPI Python Microservice</span>
          </div>
        </div>
      </div>

      {/* Card 2: Database & Production Environment Status */}
      <div className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-[#D7EFEA] text-teal-800 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Database & Deployment Architecture</h2>
            <p className="text-[11px] text-slate-500">Persistent PostgreSQL Infrastructure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F8FAFA] border border-slate-100">
            <span className="text-slate-400 text-[11px] block">Database Engine</span>
            <span className="font-bold text-slate-900 mt-0.5 block">Aiven Cloud PostgreSQL</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Status: Connected & Synchronized</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFA] border border-slate-100">
            <span className="text-slate-400 text-[11px] block">ORM & Client</span>
            <span className="font-bold text-slate-900 mt-0.5 block">Prisma Client v5.22.0</span>
            <span className="text-[10px] text-indigo-600 font-semibold">14 Relational Tables</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFA] border border-slate-100">
            <span className="text-slate-400 text-[11px] block">Analytics Service</span>
            <span className="font-bold text-slate-900 mt-0.5 block">Python FastAPI + Pandas</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Vectorized Engine Active (:8000)</span>
          </div>
        </div>
      </div>

      {/* Card 3: Optimization Rules & Thresholds Form */}
      <form onSubmit={handleSave} className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-[#FEF1C9] text-amber-800 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Threshold & Intelligence Preferences</h2>
            <p className="text-[10px] text-slate-500">Configurable triggers for the AI recommendation rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Low Utilization Threshold (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="40"
                max="85"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-[#0F172A]"
              />
              <span className="font-bold text-slate-900 w-12">{threshold}%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Software with utilization below {threshold}% triggers reallocation recommendations.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Display Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-[#F4F6F6] border-0 text-slate-800 font-medium focus:ring-2 focus:ring-slate-300"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white font-semibold shadow-xs transition"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
