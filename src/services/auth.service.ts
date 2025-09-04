
"use client";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import type { AuthFormData } from "@/components/auth/auth-form";

export const auth = getAuth(app);

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
