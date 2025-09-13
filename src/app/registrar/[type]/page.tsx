
import { RegistrationWizard } from '@/components/registrar/registration-wizard';
import { getWorkDaysForDate, type WorkDay } from '@/services/work-day.service';
import { startOfDay } from 'date-fns';
import { notFound } from 'next/navigation';
import { getCatalogAction } from '@/app/gerenciamento/actions';

export default async function RegistrarPage({ params }: { params: { type: 'today' | 'other-day' }}) {
  const registrationType = params.type;
  
  if (registrationType !== 'today' && registrationType !== 'other-day') {
    notFound();
  }

  // Fetching data on the server
  const catalog = await getCatalogAction();
  
  // NOTE: We are fetching existingDayEntries on the server, but since RegistrationWizard
  // is a client component, it will re-fetch or manage its own state on the client.
  // This server-side fetch is for potential future use or if we refactor to pass it down.
  // For 'other-day', we don't have a user ID or date here, so we pass an empty array.
  const existingDayEntries: WorkDay[] = [];

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
        catalog={catalog}
      />
    </div>
  );
}
