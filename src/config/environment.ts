export interface EnvironmentConfig {
  BASE_URL: string;
  APP_MODE: 'UAT' | 'PRODUCTION';
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Check if we should use production API (set VITE_USE_PRODUCTION_API=true in .env to use live server)
  const useProductionApi = import.meta.env.VITE_USE_PRODUCTION_API === 'true';
  
  const baseUrl = useProductionApi 
    ? 'https://adfaid.mixon.co.ke/api/v1/u/'
    : 'http://localhost:8081/api/v1/u/';
  
  const appMode = (import.meta.env.VITE_APP_MODE || 'UAT') as 'UAT' | 'PRODUCTION';

  return {
    BASE_URL: baseUrl,
    APP_MODE: appMode,
  };
};

export const ENV = getEnvironmentConfig();
