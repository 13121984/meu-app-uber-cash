
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { login as loginService, signup as signupService, User, SecurityAnswer, getUserById } from '@/services/auth.service';

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

  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('rota-certa-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUser(null);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const refreshUser = async () => {
    if (user) {
      const updatedUser = await getUserById(user.id);
      if(updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('rota-certa-user', JSON.stringify(updatedUser));
      }
    }
  };

  const login = async (userId: string, password: string) => {
    const result = await loginService(userId, password);
    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('rota-certa-user', JSON.stringify(result.user));
    } else {
        setUser(null);
        localStorage.removeItem('rota-certa-user');
    }
    return { success: result.success, user: result.user, error: result.error };
  };
  
  const signup = async (userId: string, password: string, securityAnswers: SecurityAnswer[]) => {
      const result = await signupService(userId, password, securityAnswers);
      return { success: result.success, error: result.error };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rota-certa-user');
    // We don't need to force a reload anymore, the context update will trigger component changes
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
