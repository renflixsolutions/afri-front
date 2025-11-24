import  apiService from './ApiService';
import { DashboardStats } from '@/types/dashboard';

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiService.get('dashboard');

    // The API returns { message: "...", data: {...} }
    // So response.data.data contains the actual dashboard data
    return response.data.data as DashboardStats;
  }
}

export default new DashboardService();
