
import { RegistrationWizard } from '@/components/registrar/registration-wizard';
import { notFound } from 'next/navigation';

export default function RegistrarPage({ params }: { params: { type: string } }) {
  const registrationType = params.type;

  if (registrationType !== 'today' && registrationType !== 'other-day') {
    notFound();
  }

  const isToday = registrationType === 'today';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          {isToday ? 'Registrar Dia Atual' : 'Registrar Outro Dia'}
        </h1>
        <p className="text-muted-foreground">Preencha as informações do seu dia para acompanhar seu progresso.</p>
      </div>
      <RegistrationWizard registrationType={registrationType} />
    </div>
  );
}
