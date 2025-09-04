
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, login as loginService, signup as signupService, logout as logoutService, sendPasswordReset as sendPasswordResetService, signInWithGoogle as signInWithGoogleService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: typeof loginService;
  signup: typeof signupService;
  logout: () => void;
  sendPasswordReset: typeof sendPasswordResetService;
  signInWithGoogle: typeof signInWithGoogleService;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Se o usuário está logado e na página de login, redireciona para o dashboard
        if (window.location.pathname === '/login') {
            router.push('/');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  const logout = async () => {
    await logoutService();
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login: loginService,
    signup: signupService,
    logout,
    sendPasswordReset: sendPasswordResetService,
    signInWithGoogle: signInWithGoogleService,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
