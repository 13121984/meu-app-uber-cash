
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.txia.ubercash',
  appName: 'Uber Cash TX IA',
  webDir: '.next',
  server: {
    // A URL do servidor é para live-reload, não para build final.
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
