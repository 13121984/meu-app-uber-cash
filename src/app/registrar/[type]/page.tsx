
import { RegistrationWizard } from '@/components/registrar/registration-wizard';
import { findWorkDayByDate } from '@/services/work-day.service';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

export default async function RegistrarPage({ params }: { params: { type: string } }) {
  const registrationType = params.type;

  if (registrationType !== 'today' && registrationType !== 'other-day') {
    notFound();
  }

  const isToday = registrationType === 'today';
  let initialData = null;
  let isEditing = false;

  // For 'today', we check if a record already exists to decide if we are editing or creating.
  if (isToday) {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const existingDay = await findWorkDayByDate(dateStr);
    if (existingDay) {
        initialData = existingDay;
        isEditing = true;
    }
  }

  // For 'other-day', we always start with a blank slate.
  // The wizard component will handle the date selection internally.
  // We pass a minimal object to distinguish it from a null/editing state.
  if (!initialData) {
      initialData = { id: registrationType };
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          {isToday ? 'Registrar Dia Atual' : 'Registrar Outro Dia'}
        </h1>
        <p className="text-muted-foreground">Preencha as informações do seu dia para acompanhar seu progresso.</p>
      </div>
      <RegistrationWizard 
        registrationType={registrationType} 
        initialData={initialData}
        isEditing={isEditing}
      />
    </div>
  );
}
