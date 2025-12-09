import ApiService from './ApiService';
import {
  ServicePlan,
  ServicePlanFormData,
  ServicePlansResponse,
  ServicePlanResponse,
  ServicePlanStatisticsResponse,
  DeleteServicePlanResponse,
  ServicePlanModule,
  ServicePlanTier,
} from '@/types/service-plans';

class ServicePlanService {
  private baseUrl = '/service-plans';

  /**
   * Get all service plans with optional filters
   */
  async getServicePlans(filters?: {
    module?: ServicePlanModule;
    tier?: ServicePlanTier;
  }): Promise<ServicePlan[]> {
    const params = new URLSearchParams();
    if (filters?.module) params.append('module', filters.module);
    if (filters?.tier) params.append('tier', filters.tier);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await ApiService.get<ServicePlan[]>(url);
    return response.data.data as ServicePlan[];
  }

  /**
   * Get a single service plan by ID
   */
  async getServicePlan(id: string): Promise<ServicePlan> {
    const response = await ApiService.get<ServicePlan>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data as ServicePlan;
  }

  /**
   * Create a new service plan
   */
  async createServicePlan(data: ServicePlanFormData): Promise<ServicePlan> {
    const response = await ApiService.post<ServicePlan>(
      this.baseUrl,
      data
    );
    return response.data.data as ServicePlan;
  }

  /**
   * Update an existing service plan
   */
  async updateServicePlan(
    id: string,
    data: Partial<ServicePlanFormData>
  ): Promise<ServicePlan> {
    const response = await ApiService.put<ServicePlan>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data as ServicePlan;
  }

  /**
   * Delete a service plan
   */
  async deleteServicePlan(id: string): Promise<void> {
    await ApiService.delete<void>(
      `${this.baseUrl}/${id}`
    );
  }

  /**
   * Get service plan statistics
   */
  async getStatistics(): Promise<ServicePlanStatisticsResponse['data']> {
    const response = await ApiService.get<ServicePlanStatisticsResponse['data']>(
      `${this.baseUrl}/admin/statistics`
    );
    return response.data.data as ServicePlanStatisticsResponse['data'];
  }
}

export const servicePlanService = new ServicePlanService();
export default servicePlanService;

