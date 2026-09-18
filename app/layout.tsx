import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'LicenseIQ | Software License & Subscription Intelligence Platform',
  description: 'Enterprise centralized software license, vendor contract, utilization analytics, and recommendation intelligence platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC] text-slate-900 min-h-screen">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
