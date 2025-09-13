
"use client";

import { AuthProvider } from '@/contexts/auth-context';
import { AppContent } from './app-content';

export default function RootClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}
