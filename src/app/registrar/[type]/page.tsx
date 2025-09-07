
import { RegistrationWizard } from '@/components/registrar/registration-wizard';
import { getWorkDaysForDate, type WorkDay } from '@/services/work-day.service';
import { startOfDay } from 'date-fns';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return [
    { type: 'today' },
    { type: 'other-day' },
  ]
}

export default async function RegistrarPage({ params }: { params: { type: string } }) {
  const registrationType = params.type;

  if (registrationType !== 'today' && registrationType !== 'other-day') {
    notFound();
  }

  // Para 'today', buscamos os registros existentes para hoje
  // Para 'other-day', começamos com uma lousa limpa, pois a data ainda será selecionada
  const today = startOfDay(new Date());
  const existingTodayEntries: WorkDay[] = registrationType === 'today' ? await getWorkDaysForDate(today) : [];

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
        existingDayEntries={existingTodayEntries}
      />
    </div>
  );
}
