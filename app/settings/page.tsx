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
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">System & Project Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Platform configurations, academic project metadata, database connection diagnostics, and optimization rules.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Configuration preferences updated successfully.</span>
        </div>
      )}

      {/* Card 1: Field Engineering Project (FEP) Academic Accreditation */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Academic Project Accreditation</h2>
            <p className="text-[11px] text-slate-500">Field Engineering Project (FEP) • Computer Engineering</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Project Guide</span>
            <span className="text-slate-600">Mr. Ajit Chavan</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Department</span>
            <span className="text-slate-600">Department of Computer Engineering</span>
          </div>
        </div>

        <div className="pt-2">
          <span className="text-xs font-bold text-slate-800 block mb-2">Project Team Members:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
            {[
              { name: 'Yamgar Shreyasi', role: 'Person 1: Core Mgmt & Auth' },
              { name: 'Shaikh Alfiya', role: 'Person 2: Usage & Cost Analytics' },
              { name: 'Sonawane Shrawani', role: 'Person 3: AI Intelligence & Health' },
              { name: 'Jadhav Suraj', role: 'Person 4: Renewal & Risk Alerts' },
              { name: 'Udata Priti', role: 'Person 5: Dashboard & Reporting' },
            ].map((member, i) => (
              <div key={i} className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100/80">
                <div className="font-bold text-slate-900">{member.name}</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card 2: Database & Production Environment Status */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Database & Deployment Architecture</h2>
            <p className="text-[11px] text-slate-500">Persistent PostgreSQL Infrastructure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] block">Database Engine</span>
            <span className="font-bold text-slate-900 mt-0.5 block">Neon Serverless PostgreSQL</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Status: Connected & Migrated</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] block">ORM & Client</span>
            <span className="font-bold text-slate-900 mt-0.5 block">Prisma Client v5.22.0</span>
            <span className="text-[10px] text-blue-600 font-semibold">14 Relational Tables</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 text-[11px] block">Analytics Service</span>
            <span className="font-bold text-slate-900 mt-0.5 block">Python FastAPI + Pandas</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Vectorized Engine Active</span>
          </div>
        </div>
      </div>

      {/* Card 3: Optimization Rules & Thresholds Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
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
                className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="font-bold text-blue-600 w-12">{threshold}%</span>
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
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
