
"use client"

import { SettingsForm } from './settings-form';
import { CatalogManager } from './catalog-manager';
import type { Settings } from '@/types/settings';
import type { Catalog } from '@/services/catalog.service';

interface ConfiguracoesClientProps {
    settings: Settings;
    catalog: Catalog;
}

export function ConfiguracoesClient({ settings, catalog }: ConfiguracoesClientProps) {
    return (
        <>
            <SettingsForm initialData={settings} fuelTypes={catalog.fuel} />
            <CatalogManager initialData={catalog} />
        </>
    )
}
