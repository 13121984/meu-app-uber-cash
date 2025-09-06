
"use client"

import { SettingsForm } from './settings-form';
import { CatalogManager } from './catalog-manager';
import type { Settings } from '@/types/settings';
import type { Catalog } from '@/services/catalog.service';
import { ImportCard } from './import-card';

interface ConfiguracoesClientProps {
    settings: Settings;
    catalog: Catalog;
}

export function ConfiguracoesClient({ settings, catalog }: ConfiguracoesClientProps) {
    return (
        <div className="space-y-8">
            <SettingsForm initialData={settings} fuelTypes={catalog.fuel} />
            <CatalogManager initialData={catalog} />
            <ImportCard />
        </div>
    )
}
