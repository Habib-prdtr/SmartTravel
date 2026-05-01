import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarttravel.app',
  appName: 'Smart Travel',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
