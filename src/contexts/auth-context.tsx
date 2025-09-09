
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { login as loginService, signup as signupService, User, SecurityAnswer, getUserById } from '@/services/auth.service';
import { clearAllDataForUser } from '@/services/work-day.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; user?: User, error?: string }>;
  signup: (userId: string, password: string, securityAnswers: SecurityAnswer[]) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getActiveUserId = useCallback(() => {
    try {
      const storedUserJSON = localStorage.getItem('rota-certa-user');
      if (storedUserJSON) {
        const storedUser = JSON.parse(storedUserJSON);
        return storedUser.id;
      }
    } catch {
      return null;
    }
    return null;
  }, []);

  const loadUserFromStorage = useCallback(async () => {
    setLoading(true);
    const userId = getActiveUserId();
    if (userId) {
      try {
        const freshUser = await getUserById(userId);
        if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('rota-certa-user', JSON.stringify(freshUser));
        } else {
            // User might have been deleted, clear storage
            setUser(null);
            localStorage.removeItem('rota-certa-user');
        }
      } catch (error) {
        console.error("Failed to fetch user from server, using stale local data.", error);
        // Fallback to local data if server is unreachable
        const storedUserJSON = localStorage.getItem('rota-certa-user');
        if (storedUserJSON) {
          setUser(JSON.parse(storedUserJSON));
        }
      }
    }
    setLoading(false);
  }, [getActiveUserId]);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const refreshUser = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const updatedUser = await getUserById(user.id);
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
          await clearAllDataForUser(userId);
      }
      setLoading(false);
      return { success: result.success, error: result.error };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rota-certa-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
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
