
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
  
  // Para 'today', o objetivo é sempre ADICIONAR um novo período/turno.
  // Portanto, sempre começamos com uma lousa em branco.
  if (registrationType === 'today') {
      initialData = { id: 'today' }; // Passa um objeto mínimo para indicar um novo registro hoje.
      isEditing = false; // Garante que não estamos no modo de edição.
  }

  // Para 'other-day', começamos sempre com uma lousa em branco para um novo dia.
  if (registrationType === 'other-day') {
      initialData = { id: 'other-day' };
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          {registrationType === 'today' ? 'Registrar Novo Período' : 'Registrar Outro Dia'}
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
