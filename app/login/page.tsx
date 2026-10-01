'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Layers,
  TrendingUp,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Handle standard form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both corporate email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      setLoading(false);

      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'A network error occurred. Please try again.');
    }
  };

  /**
   * Handle Role Selection Chip Click:
   * STRICT REQUIREMENT: Clicking a role button MUST NOT automatically authenticate the user!
   * It only populates the demo credentials into the form so the user can review them,
   * keeping the user in control until they manually click "Sign In".
   */
  const handleSelectRole = (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    setSelectedRole(role);
    setError('');

    if (role === 'ADMIN') {
      setEmail('admin@enterprise.com');
      setPassword('Password@123');
    } else if (role === 'MANAGER') {
      setEmail('manager.eng@enterprise.com');
      setPassword('Password@123');
    } else if (role === 'EMPLOYEE') {
      setEmail('alex.chen@enterprise.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#140D2E] text-white flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden select-none">
      {/* Ambient background glows inspired by modern SaaS aesthetic */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-purple-700/25 to-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/25 to-blue-700/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container: Two-column layout matching reference media_1790783815398 */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Enterprise Branding & Intelligence Highlights */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-8 px-2 sm:px-4">
          
          {/* Brand Logo & Name */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 p-0.5 shadow-xl shadow-indigo-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-[#140D2E]/90 rounded-[14px] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white">LicenseIQ</h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    Enterprise
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 leading-snug">
              Software License & Subscription Intelligence Platform
            </h2>

            <p className="text-sm text-slate-300/90 leading-relaxed font-normal">
              A unified platform to centralize software assets, eliminate redundant subscriptions,
              monitor real-time seat utilization, and predict renewal costs with precision.
            </p>
          </div>

          {/* Core Intelligence Capability Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md transition hover:bg-white/[0.08]">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs mb-1">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Centralized</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Single source of truth for software & vendor contracts.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md transition hover:bg-white/[0.08]">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Zero Waste</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Identifies unused seats & provides immediate reallocation.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md transition hover:bg-white/[0.08]">
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Health Score</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                0-100 composite index for subscription efficiency.
              </p>
            </div>
          </div>

          {/* Quick Action Info Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Role-Based Access Control (RBAC)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean, Frosted Glass Enterprise Login Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white/[0.06] backdrop-blur-2xl rounded-3xl p-7 sm:p-9 border border-white/15 shadow-2xl shadow-purple-950/50 relative">
            
            {/* Form Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white tracking-tight">Log In to LicenseIQ</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials or select a role preset below to test.
              </p>
            </div>

            {/* Role Preset Selector Chips: Populates credentials for manual review, DOES NOT auto-login */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Role Preset (Demo)
                </span>
                <span className="text-[10px] text-slate-500">Requires manual Sign In</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole('ADMIN')}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'ADMIN'
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Admin</span>
                    {selectedRole === 'ADMIN' && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">Full System</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('MANAGER')}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'MANAGER'
                      ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Manager</span>
                    {selectedRole === 'MANAGER' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">Approvals</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('EMPLOYEE')}
                  className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                    selectedRole === 'EMPLOYEE'
                      ? 'bg-sky-600/30 border-sky-400 text-white shadow-sm shadow-sky-500/20'
                      : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Employee</span>
                    {selectedRole === 'EMPLOYEE' && <CheckCircle2 className="w-3 h-3 text-sky-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">My Licenses</span>
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Your Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSelectedRole(null);
                    }}
                    placeholder="name@enterprise.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-white/[0.07] border border-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Your Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedRole(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white/[0.07] border border-white/15 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 transition text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-sky-500 focus:ring-sky-400 focus:ring-offset-0 focus:ring-1"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Reset: Passwords for seeded users are default Password@123')}
                  className="text-sky-400 hover:text-sky-300 transition hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button: Prominent cyan/teal or gradient button matching visual reference */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2 text-slate-900">
                    <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    Authenticating credentials...
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Subtle Enterprise Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-slate-400">
                Protected by Enterprise Role-Based Access & JWT Security
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
