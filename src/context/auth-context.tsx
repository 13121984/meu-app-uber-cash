
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import from the central firebase config
import { logout as logoutService, login as loginService, signup as signupService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import type { AuthFormData } from '@/components/auth/auth-form';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: typeof loginService;
  signup: typeof signupService;
  logout: () => void;
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
    });
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    await logoutService();
    // O redirecionamento será tratado pelo ProtectedRoute
  };

  const value: AuthContextType = {
    user,
    loading,
    login: loginService,
    signup: signupService,
    logout,
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
