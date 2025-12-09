
export interface EnvironmentConfig {
  BASE_URL: string;
  APP_MODE: 'UAT' | 'PRODUCTION';
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // const baseUrl = 'http://localhost:8083/api/v1/u/';
  const baseUrl = 'https://api.afrithriveglobal.com/api/v1/u/';
  const appMode = 'PRODUCTION';
  // const appMode = (import.meta.env.VITE_APP_MODE || 'UAT') as 'UAT' | 'PRODUCTION';

  return {
    BASE_URL: baseUrl,
    APP_MODE: appMode,
  };
};

export const ENV = getEnvironmentConfig();
