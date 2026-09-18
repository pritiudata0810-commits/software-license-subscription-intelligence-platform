'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    setLoading(true);
    setEmail(demoEmail);
    setPassword('Password@123');

    const res = await login(demoEmail, 'Password@123');
    setLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C] flex flex-col justify-center items-center px-4 py-12 select-none relative overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-200/60 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/30 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">LicenseIQ Platform</h1>
          <p className="text-xs text-slate-500 mt-1">
            Software License & Subscription Intelligence System
          </p>
        </div>

        {/* FEP Academic Badge */}
        <div className="mb-6 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
          <Award className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-blue-900 leading-snug">
            <span className="font-bold">Field Engineering Project (FEP)</span> • Computer Engineering
            <div className="text-[10px] text-blue-700 mt-0.5 font-medium">
              Team: Yamgar S., Shaikh A., Sonawane S., Jadhav S., Udata P. | Guide: Mr. Ajit Chavan
            </div>
          </div>
        </div>

        {/* Quick 1-Click Demo Login Chips */}
        <div className="mb-6">
          <label className="text-[11px] font-semibold text-slate-600 mb-2 block uppercase tracking-wider">
            Quick 1-Click Demo Access
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@enterprise.com')}
              className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-left transition flex flex-col"
            >
              <span className="text-[11px] font-bold text-slate-800">Admin</span>
              <span className="text-[9px] text-slate-500 truncate">Full System</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('manager.eng@enterprise.com')}
              className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left transition flex flex-col"
            >
              <span className="text-[11px] font-bold text-slate-800">Manager</span>
              <span className="text-[9px] text-slate-500 truncate">Approvals & Stats</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('alex.chen@enterprise.com')}
              className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 text-left transition flex flex-col"
            >
              <span className="text-[11px] font-bold text-slate-800">Employee</span>
              <span className="text-[9px] text-slate-500 truncate">Requests & Seats</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@enterprise.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Secure Role-Based Authentication with PostgreSQL & JWT
          </p>
        </div>
      </div>
    </div>
  );
}
