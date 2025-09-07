
"use client"

import { SettingsForm } from './settings-form';
import { CatalogManagerCard } from './catalog-manager-card';
import { ImportCard } from './import-card';
import { BackupCard } from './backup-card';
import { UserProfileCard } from './user-profile-card';
import { VehicleManagerCard } from './vehicle-manager-card';
import { DemoDataCard } from './demo-data-card';

export function ConfiguracoesClient() {
    return (
        <div className="space-y-8">
            <UserProfileCard />
            <VehicleManagerCard />
            <SettingsForm />
            <DemoDataCard />
            <BackupCard />
            <CatalogManagerCard />
            <ImportCard />
        </div>
    )
}
