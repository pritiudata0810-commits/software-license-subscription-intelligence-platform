'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
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
        router.refresh();
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
   * STRICT MANDATE: Populates credentials for review only.
   * DOES NOT automatically submit or redirect.
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
    <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden select-none">
      
      {/* ============================================================== */}
      {/* FLOATING ORGANIC SHAPES & DOT MATRIX (from media_1791173942245.png) */}
      {/* ============================================================== */}

      {/* Top right coral crescent/semicircle */}
      <div className="absolute -top-12 right-24 w-64 h-36 bg-[#FF8C68] rounded-b-full opacity-90 pointer-events-none transform -rotate-6" />

      {/* Top center lavender/periwinkle curved shape */}
      <div className="absolute -top-16 left-1/2 -translate-x-12 w-64 h-64 bg-gradient-to-br from-[#B5A4E8] to-[#9B89D8] rounded-full opacity-80 blur-[1px] pointer-events-none" />

      {/* Top right subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFEFEA] rounded-full blur-[80px] -z-10 pointer-events-none" />

      {/* Far right purple semicircle */}
      <div className="absolute top-16 -right-16 w-52 h-52 bg-gradient-to-l from-[#C6B6F5] to-[#B09CE6] rounded-full pointer-events-none hidden md:block" />

      {/* Dot matrix grid on the right (matching media_1791173942245.png) */}
      <div className="absolute top-1/3 right-20 hidden lg:grid grid-cols-8 gap-3 opacity-30 pointer-events-none">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        ))}
      </div>

      {/* Bottom center-right soft red vertical pebble/shield */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-20 w-44 h-64 bg-gradient-to-t from-[#FF4D4D] to-[#FF7060] rounded-[60px] opacity-90 blur-[0.5px] pointer-events-none shadow-2xl shadow-red-500/20" />

      {/* Bottom right bright cyan semicircle */}
      <div className="absolute bottom-6 right-1/4 w-56 h-28 bg-[#62D0DF] rounded-t-full pointer-events-none transform -rotate-12" />

      {/* Bottom far right lavender rounded triangle/pebble */}
      <div className="absolute bottom-12 right-12 w-48 h-40 bg-[#C3B5F5] rounded-[36px] pointer-events-none transform rotate-12 hidden md:block" />

      {/* Bottom left soft pastel glow */}
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-100/40 rounded-full blur-[100px] pointer-events-none" />

      {/* ============================================================== */}
      {/* MAIN TWO-COLUMN CONTENT GRID */}
      {/* ============================================================== */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* LEFT COLUMN: LOGIN CARD & FORM */}
        <div className="lg:col-span-5 flex flex-col justify-center max-w-md mx-auto w-full">
          
          {/* Brand Logo & Heading */}
          <div className="flex flex-col items-center mb-6 text-center">
            {/* Gradient Logo "L." matching reference "C." mark */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#9B51E0] via-[#BB6BD9] to-[#56CCF2] p-1 shadow-md mb-4 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                <span className="text-2xl font-black bg-gradient-to-r from-[#8E44AD] to-[#6C5CE7] bg-clip-text text-transparent">
                  L.
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Login
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Welcome to LicenseIQ. Enter your corporate credentials below.
            </p>
          </div>

          {/* Quick Role Fill Chips (Populate only, NO auto-submit) */}
          <div className="mb-5 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Preset Demo Accounts
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click to fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                  selectedRole === 'ADMIN'
                    ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {selectedRole === 'ADMIN' && <Check className="w-3 h-3" />}
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('MANAGER')}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                  selectedRole === 'MANAGER'
                    ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {selectedRole === 'MANAGER' && <Check className="w-3 h-3" />}
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('EMPLOYEE')}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                  selectedRole === 'EMPLOYEE'
                    ? 'bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {selectedRole === 'EMPLOYEE' && <Check className="w-3 h-3" />}
                Employee
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-slate-300 focus:bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 transition"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-[#F4F5F7] border border-transparent focus:border-slate-300 focus:bg-white text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Keep logged in & Forgot password row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6C5CE7] focus:ring-[#6C5CE7] border-slate-300 cursor-pointer"
                />
                <span>Keep me logged in</span>
              </label>

              <button
                type="button"
                onClick={() => setError('Contact your IT administrator at support@enterprise.com for password resets.')}
                className="text-xs font-semibold text-[#6C5CE7] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button matching media_1791173942245.png */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-[#6C5CE7] hover:bg-[#5B4BC4] active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-[#6C5CE7]/25 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 text-center text-xs text-slate-400">
            <span>Single-tenant corporate deployment • </span>
            <span className="font-semibold text-slate-600">LicenseIQ Security</span>
          </div>

        </div>

        {/* RIGHT COLUMN: HERO TYPOGRAPHY & MOTIF (from media_1791173942245.png) */}
        <div className="lg:col-span-7 hidden lg:flex flex-col justify-center items-center lg:items-start pl-4 xl:pl-12 relative">
          
          {/* Coral pebble shape behind typography */}
          <div className="absolute -left-4 top-1/2 -translate-y-8 w-28 h-14 bg-[#FF8C68] rounded-full opacity-90 transform -rotate-12 pointer-events-none" />

          {/* Hero Typography matching reference exactly */}
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Changing the way <br />
              organizations optimize <br />
              software subscriptions
            </h2>
            <div className="mt-4 flex items-center gap-2 text-slate-400 font-semibold tracking-wide text-sm">
              <span className="w-8 h-0.5 bg-[#6C5CE7]" />
              <span>LicenseIQ Intelligence Engine</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
