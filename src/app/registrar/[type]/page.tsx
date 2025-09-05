
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

  // For both 'today' and 'other-day', we check if a record already exists
  // to decide if we are editing or creating a new one.
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const existingDay = await findWorkDayByDate(dateStr);

  if (existingDay) {
      initialData = existingDay;
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
        // Pass existing day data to start in edit mode, or a placeholder for a new registration
        initialData={existingDay ?? { id: registrationType }}
        isEditing={!!existingDay}
      />
    </div>
  );
}
