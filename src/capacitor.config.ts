
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uber.cash',
  appName: 'Rota Certa',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // Isso é para desenvolvimento com live reload. Para produção, o webDir é usado.
    // url: 'http://192.168.0.10:3000', // Substitua pelo seu IP local
    // cleartext: true
  },
   plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#111827", // Cor de fundo do tema escuro
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#f97316", // Laranja da nossa marca
    },
  },
};

export default config;
