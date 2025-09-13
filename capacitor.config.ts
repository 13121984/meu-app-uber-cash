
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.txia.ubercash',
  appName: 'Uber Cash TX IA', // Nome mais curto para a home screen do celular
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // A configuração do servidor é usada para desenvolvimento com live reload.
    // Para a versão de produção, o Capacitor usa o conteúdo da pasta `out`.
    // url: 'http://192.168.0.10:3000', // Exemplo: Substitua pelo seu IP local para testes
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
