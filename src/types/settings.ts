
export type AppTheme = 'light' | 'dark';
export type TextColor = 'white' | 'gray' | 'purple';

export interface Settings {
  theme: AppTheme;
  primaryColor?: string;
  backgroundColor?: string;
  textColor: TextColor;
  weeklyBackup: boolean;
  backupEmail: string;
  maintenanceNotifications: boolean;
  defaultFuelType: 'Etanol' | 'Gasolina Aditivada' | 'GNV' | '';
}
