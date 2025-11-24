import apiService from './ApiService';

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface CompanySettingsResponse {
  data: CompanySettings;
}

export const companySettingsService = {
  getCompanySettings: async (): Promise<CompanySettings> => {
    const response = await apiService.get<CompanySettingsResponse>('company-settings');
    return response.data.data;
  },

  updateCompanySettings: async (settings: CompanySettings): Promise<{ message: string }> => {
    const response = await apiService.put('company-settings', settings);
    return response.data;
  },
};

export default companySettingsService;
