
"use client";

import { RegistrationWizard } from '@/components/registrar/registration-wizard';
import { getWorkDaysForDate, type WorkDay } from '@/services/work-day.service';
import { startOfDay } from 'date-fns';
import { notFound, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';


export default function RegistrarPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const registrationType = params.type as 'today' | 'other-day';
  
  const [existingDayEntries, setExistingDayEntries] = useState<WorkDay[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (user && registrationType === 'today') {
      setIsDataLoading(true);
      getWorkDaysForDate(user.id, startOfDay(new Date()))
        .then(data => {
          setExistingDayEntries(data);
        })
        .catch(err => {
          console.error("Failed to load today's entries:", err);
          setExistingDayEntries([]);
        })
        .finally(() => {
          setIsDataLoading(false);
        });
    } else {
        setIsDataLoading(false);
    }
  }, [user, registrationType]);

  if (registrationType !== 'today' && registrationType !== 'other-day') {
    notFound();
  }

  if (loading || isDataLoading) {
    return (
       <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          {registrationType === 'today' ? 'Registrar Período de Hoje' : 'Registrar Outro Dia'}
        </h1>
        <p className="text-muted-foreground">Preencha as informações do seu dia para acompanhar seu progresso.</p>
      </div>
      <RegistrationWizard 
        registrationType={registrationType} 
        existingDayEntries={existingDayEntries}
      />
    </div>
  );
}
