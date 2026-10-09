'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  designation?: string;
  department?: {
    id: string;
    name: string;
    code: string;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  quickLoginAs: (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch auth session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string = 'Password@123') => {
    try {
      const makeRequest = async () => {
        return fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email.trim(), password }),
        });
      };

      let res = await makeRequest();
      let text = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        // If server was recompiling or initializing on cold start, retry once
        await new Promise((r) => setTimeout(r, 600));
        res = await makeRequest();
        text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          return { success: false, error: 'Authentication service warming up. Please try again.' };
        }
      }

      if (data && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data?.error || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const quickLoginAs = async (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    let email = 'admin@enterprise.com';
    if (role === 'MANAGER') email = 'manager.eng@enterprise.com';
    if (role === 'EMPLOYEE') email = 'alex.chen@enterprise.com';

    await login(email, 'Password@123');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, quickLoginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
