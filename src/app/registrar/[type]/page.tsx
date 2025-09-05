
import { RegistrationWizard } from '@/components/registrar/registration-wizard';
import { findWorkDayByDate } from '@/services/work-day.service';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

export default async function RegistrarPage({ params }: { params: { type: string } }) {
  const registrationType = params.type;

  if (registrationType !== 'today' && registrationType !== 'other-day') {
    notFound();
  }

  let initialData = null;
  let isEditing = false;
  
  // Para 'today', verificamos se já existe um registro para decidir se estamos editando ou criando.
  if (registrationType === 'today') {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const existingDay = await findWorkDayByDate(dateStr);
    if (existingDay) {
        initialData = existingDay;
        isEditing = true;
    } else {
        // Se não houver dia existente, passamos um objeto mínimo para indicar um novo registro hoje.
        initialData = { id: 'today' };
    }
  }

  // Para 'other-day', começamos sempre com uma lousa em branco.
  // Passamos um objeto mínimo para que o wizard saiba que é um novo registro.
  if (registrationType === 'other-day') {
      initialData = { id: 'other-day' };
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          {isEditing ? 'Editar Dia Atual' : registrationType === 'today' ? 'Registrar Dia Atual' : 'Registrar Outro Dia'}
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
