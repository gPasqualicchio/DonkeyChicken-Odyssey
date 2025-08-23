import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.38d7b07695cf47f6abc96799d881e205',
  appName: 'Adventure Quest',
  webDir: 'dist',
  server: {
    url: 'https://38d7b076-95cf-47f6-abc9-6799d881e205.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false
    }
  }
};

export default config;