'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: 'volunteer' | 'organization';
    city?: string;
    skills?: string[];
    category?: string | string[];
    orgName?: string;
  }) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Attach organization onto user and normalize id → _id (security: never trust client-only role). */
function normalizeAuthPayload(payload: any): User | null {
  if (!payload) return null;
  const rawUser = payload.user || (payload._id || payload.id ? payload : null);
  if (!rawUser) return null;

  const id = rawUser._id || rawUser.id;
  if (!id) return null;

  const org = payload.organization ?? rawUser.organization ?? null;

  return {
    ...rawUser,
    _id: String(id),
    organization: org
      ? {
          _id: String(org._id || org.id),
          name: org.name,
          category: org.category,
          logo: org.logo,
          verificationStatus: org.verificationStatus || 'pending',
        }
      : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const savedToken = api.getToken();
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(savedToken);
    try {
      const data = await api.getMe();
      const normalized = normalizeAuthPayload(data);
      setUser(normalized);
    } catch (err) {
      console.warn('[AuthContext] Token expired or invalid, logging out:', err);
      api.clearToken();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.token) {
      setToken(res.token);
      setUser(normalizeAuthPayload(res));
    }
    return { ...res, user: normalizeAuthPayload(res) };
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'volunteer' | 'organization';
    city?: string;
    skills?: string[];
    category?: string | string[];
    orgName?: string;
  }) => {
    const res = await api.signup(data);
    if (res.token) {
      setToken(res.token);
      setUser(normalizeAuthPayload(res));
    }
    return { ...res, user: normalizeAuthPayload(res) };
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
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

/** Safe post-auth path: only same-origin relative paths (open-redirect protection). */
export function safeRedirectPath(redirect: string | null | undefined, fallback: string): string {
  if (!redirect) return fallback;
  if (!redirect.startsWith('/') || redirect.startsWith('//') || redirect.includes('\\')) {
    return fallback;
  }
  return redirect;
}

export function postAuthPath(role: string | undefined, redirectParam?: string | null): string {
  const fallback =
    role === 'admin' ? '/admin' : role === 'organization' ? '/dashboard' : '/missions/browse';
  return safeRedirectPath(redirectParam, fallback);
}
