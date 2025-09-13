
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { login as loginService, signup as signupService, User, SecurityAnswer, getUserById, Plan, updateUserPreferences } from '@/services/auth.service';
import { clearAllDataForUserAction } from '@/app/gerenciamento/actions';
import type { AppTheme } from '@/types/settings';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; user?: User, error?: string }>;
  signup: (userId: string, password: string, securityAnswers: SecurityAnswer[]) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isPro: boolean;
  isAutopilot: boolean;
  setColorTheme: (theme: string) => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = useCallback(async () => {
    const storedUserJSON = localStorage.getItem('rota-certa-user');
    if (storedUserJSON) {
      try {
        const storedUser = JSON.parse(storedUserJSON);
        const freshUser = await getUserById(storedUser.id);
        if (freshUser) {
          setUser(freshUser);
        } else {
          // User might have been deleted from the backend
          setUser(null);
          localStorage.removeItem('rota-certa-user');
        }
      } catch (error) {
        console.error("Failed to fetch user, clearing stored data.", error);
        setUser(null);
        localStorage.removeItem('rota-certa-user');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // This effect runs only on the client side after hydration
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const refreshUser = async () => {
    const storedUserJSON = localStorage.getItem('rota-certa-user');
    if (!storedUserJSON) return;

    setLoading(true);
    try {
        const storedUser = JSON.parse(storedUserJSON);
        const updatedUser = await getUserById(storedUser.id);
        if(updatedUser) {
            setUser(updatedUser);
            localStorage.setItem('rota-certa-user', JSON.stringify(updatedUser));
        }
    } catch (e) {
        console.error("Failed to refresh user:", e);
    } finally {
        setLoading(false);
    }
  };

  const login = async (userId: string, password: string) => {
    setLoading(true);
    const result = await loginService(userId, password);
    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('rota-certa-user', JSON.stringify(result.user));
    } else {
        setUser(null);
        localStorage.removeItem('rota-certa-user');
    }
    setLoading(false);
    return { success: result.success, user: result.user, error: result.error };
  };
  
  const signup = async (userId: string, password: string, securityAnswers: SecurityAnswer[]) => {
      setLoading(true);
      const result = await signupService(userId, password, securityAnswers);
      // On successful signup, also clear any data for that user ID to ensure a clean slate
      if (result.success) {
          await clearAllDataForUserAction(userId);
      }
      setLoading(false);
      return { success: result.success, error: result.error };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rota-certa-user');
  };
  
  const setColorTheme = async (colorTheme: string) => {
    if (user) {
      await updateUserPreferences(user.id, { colorTheme });
      await refreshUser();
    }
  };

  const setTheme = async (theme: AppTheme) => {
      if(user) {
        await updateUserPreferences(user.id, { theme });
        await refreshUser();
      }
  }

  const isPro = user?.plan === 'pro' || user?.plan === 'autopilot';
  const isAutopilot = user?.plan === 'autopilot';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser, isPro, isAutopilot, setColorTheme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
