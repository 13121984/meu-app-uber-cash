
"use client";

import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { loading } = useAuth();
  
  if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  return <DashboardClient />;
}
