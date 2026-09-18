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
    return <main className="min-h-screen bg-[#0B192C]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 pt-16 md:pt-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
