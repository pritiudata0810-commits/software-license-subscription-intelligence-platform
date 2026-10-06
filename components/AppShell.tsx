'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '@/context/AuthContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/';

  if (isAuthPage) {
    return <main className="min-h-screen bg-white">{children}</main>;
  }

  return (
    // Ambient pastel sage canvas inspired by media_1791173942344.jpg
    <div className="min-h-screen bg-[#DCEAE7] p-2 sm:p-4 lg:p-6 flex items-center justify-center font-sans antialiased text-slate-800">
      
      {/* Floating Tablet App Shell matching reference image */}
      <div className="w-full max-w-[1680px] min-h-[94vh] bg-[#FAFAFA] rounded-[28px] sm:rounded-[40px] shadow-2xl shadow-slate-900/10 border border-white/70 overflow-hidden flex flex-col lg:flex-row relative">
        
        {/* Left Minimalist Navigation Column */}
        <Sidebar />

        {/* Right Content Enclosure */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] overflow-hidden">
          {/* Header Bar */}
          <Navbar />

          {/* Main Dashboard / Page Viewport */}
          <main className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
