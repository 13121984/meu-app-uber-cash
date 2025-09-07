
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { login as loginService, signup as signupService, User, SecurityAnswer } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userId: string, password: string, securityAnswers: SecurityAnswer[]) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta carregar o usuário do localStorage na inicialização
    const storedUser = localStorage.getItem('rota-certa-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (userId: string, password: string) => {
    const result = await loginService(userId, password);
    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('rota-certa-user', JSON.stringify(result.user));
    }
    return { success: result.success, error: result.error };
  };
  
  const signup = async (userId: string, password: string, securityAnswers: SecurityAnswer[]) => {
      const result = await signupService(userId, password, securityAnswers);
      return { success: result.success, error: result.error };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rota-certa-user');
    // Força um recarregamento para garantir que o estado seja limpo em toda a aplicação
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
