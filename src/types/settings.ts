
export type AppTheme = 'light' | 'dark';

export interface Settings {
  theme: AppTheme;
  weeklyBackup: boolean;
  backupEmail: string;
  maintenanceNotifications: boolean;
  defaultFuelType: 'Etanol' | 'Gasolina Aditivada' | 'GNV' | '';
}
