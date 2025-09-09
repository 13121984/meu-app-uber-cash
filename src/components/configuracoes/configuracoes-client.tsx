
"use client"

import { SettingsForm } from './settings-form';
import { CatalogManagerCard } from './catalog-manager-card';
import { ImportCard } from './import-card';
import { BackupCard } from './backup-card';
import { UserProfileCard } from './user-profile-card';
import { VehicleManagerCard } from './vehicle-manager-card';
import { DemoDataCard } from './demo-data-card';
import { LayoutCustomizationCard } from './layout-customization-card';
import { useAuth } from '@/contexts/auth-context';
import { HelpAndSupportCard } from './help-and-support-card';
import { RaceAnalyzerCard } from './race-analyzer-card';

export function ConfiguracoesClient() {
    const { user } = useAuth();
    const isPremium = user?.isPremium || false;

    return (
        <div className="space-y-8">
            <UserProfileCard />
            <VehicleManagerCard />
            <SettingsForm />
            <LayoutCustomizationCard />
            <RaceAnalyzerCard />
            <HelpAndSupportCard />
            <DemoDataCard />
            <BackupCard />
            <CatalogManagerCard isPremium={isPremium} />
            <ImportCard />
        </div>
    )
}

    