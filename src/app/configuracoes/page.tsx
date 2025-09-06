
import { Settings } from 'lucide-react';
import { getSettings } from '@/services/settings.service';
import { getCatalog } from '@/services/catalog.service';
import { ConfiguracoesClient } from '@/components/configuracoes/configuracoes-client';

export default async function ConfiguracoesPage() {
  const settings = await getSettings();
  const catalog = await getCatalog();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                Configurações
            </h1>
            <p className="text-muted-foreground">Ajuste as preferências e catálogos do aplicativo.</p>
        </div>
      </div>
      <ConfiguracoesClient settings={settings} catalog={catalog} />
    </div>
  );
}
