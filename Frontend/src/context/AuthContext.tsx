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
  }) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
      if (data && data.user) {
        setUser(data.user);
      } else if (data && data._id) {
        setUser(data);
      }
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
      setUser(res.user);
    }
    return res;
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'volunteer' | 'organization';
    city?: string;
    skills?: string[];
  }) => {
    const res = await api.signup(data);
    if (res.token) {
      setToken(res.token);
      setUser(res.user);
    }
    return res;
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
