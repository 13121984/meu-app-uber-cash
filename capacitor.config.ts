
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.txia.ubercash',
  appName: 'Uber Cash TX IA', // Nome mais curto para a home screen do celular
  webDir: 'out',
  server: {
    // A configuração do servidor foi removida para usar o webDir 'out' em produção.
    // Para usar live-reload em desenvolvimento, descomente e ajuste o IP.
    // url: 'http://192.168.0.10:3000',
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
