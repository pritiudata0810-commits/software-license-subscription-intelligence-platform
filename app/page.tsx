'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#DCEAE7] flex items-center justify-center">
      <div className="p-8 rounded-[32px] bg-white shadow-xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white font-black text-xl shadow-md animate-pulse">
          <span className="bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">L</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-sm font-bold text-slate-800">LicenseIQ Intelligence</span>
          <span className="text-xs text-slate-400 font-medium">Initializing workspace session...</span>
        </div>
      </div>
    </div>
  );
}
