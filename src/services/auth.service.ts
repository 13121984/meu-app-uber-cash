
"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase"; // Importa a instância centralizada
import type { AuthFormData } from "@/components/auth/auth-form";

export const signup = (data: AuthFormData) => {
  return createUserWithEmailAndPassword(auth, data.email, data.password);
};

export const login = (data: AuthFormData) => {
  return signInWithEmailAndPassword(auth, data.email, data.password);
};

export const sendPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const logout = () => {
  return signOut(auth);
};
