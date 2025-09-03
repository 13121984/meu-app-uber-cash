import { RegistrationWizard } from '@/components/registrar/registration-wizard';

export default function RegistrarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Registrar Dia de Trabalho</h1>
        <p className="text-muted-foreground">Preencha as informações do seu dia para acompanhar seu progresso.</p>
      </div>
      <RegistrationWizard />
    </div>
  );
}
