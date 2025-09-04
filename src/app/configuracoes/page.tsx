import { Settings } from 'lucide-react';
import { getSettings } from '@/services/settings.service';
import { SettingsForm } from '@/components/configuracoes/settings-form';

export default async function ConfiguracoesPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                Configurações
            </h1>
            <p className="text-muted-foreground">Ajuste as preferências do aplicativo.</p>
        </div>
      </div>
      <SettingsForm initialData={settings} />
    </div>
  );
}
