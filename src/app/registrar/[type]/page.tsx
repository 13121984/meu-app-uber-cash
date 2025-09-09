
import { RegistrationWizard } from '@/components/registrar/registration-wizard';
import { getWorkDaysForDate, type WorkDay } from '@/services/work-day.service';
import { startOfDay } from 'date-fns';
import { notFound } from 'next/navigation';
import { getActiveUser } from '@/services/auth.service';

// Adicionado para suportar `output: 'export'` com rotas dinâmicas.
export async function generateStaticParams() {
  return [
    { type: 'today' },
    { type: 'other-day' },
  ];
}

export default async function RegistrarPage({ params }: { params: { type: 'today' | 'other-day' }}) {
  const registrationType = params.type;
  
  if (registrationType !== 'today' && registrationType !== 'other-day') {
    notFound();
  }

  // A busca de dados agora é feita no servidor.
  const user = await getActiveUser();
  let existingDayEntries: WorkDay[] = [];

  if (user && registrationType === 'today') {
    try {
      existingDayEntries = await getWorkDaysForDate(user.id, startOfDay(new Date()));
    } catch (err) {
      console.error("Failed to load today's entries on server:", err);
      existingDayEntries = [];
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          {registrationType === 'today' ? 'Registrar Período de Hoje' : 'Registrar Outro Dia'}
        </h1>
        <p className="text-muted-foreground">Preencha as informações do seu dia para acompanhar seu progresso.</p>
      </div>
      {/* O componente RegistrationWizard é um client component, então a interatividade é mantida. */}
      <RegistrationWizard 
        registrationType={registrationType} 
        existingDayEntries={existingDayEntries}
      />
    </div>
  );
}
