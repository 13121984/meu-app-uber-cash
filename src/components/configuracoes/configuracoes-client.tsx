"use client"

import { SettingsForm } from './settings-form';
import { CatalogManagerCard } from './catalog-manager-card';
import { ImportCard } from './import-card';

// Este componente agora serve apenas como um container de layout.
// Ele não busca nem gerencia mais o estado dos seus filhos.
export function ConfiguracoesClient() {
    return (
        <div className="space-y-8">
            <SettingsForm />
            <CatalogManagerCard />
            <ImportCard />
        </div>
    )
}
