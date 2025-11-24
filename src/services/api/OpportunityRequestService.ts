// filepath: c:\Users\omond\WebstormProjects\afri-front\src\services\api\OpportunityRequestService.ts
import apiService from './ApiService';
import { OpportunityRequestsResponse, OpportunityRequestResponse, OpportunityRequest } from '@/types/opportunity-requests';

class OpportunityRequestService {
  async getOpportunityRequests(options?: { page?: number; search?: string; }): Promise<OpportunityRequestsResponse> {
    const query = new URLSearchParams();
    const page = options?.page ?? 1;
    query.set('page', String(page));
    if (options?.search) query.set('search', options.search);

    const response = await apiService.get(
      `opportunity-requests?${query.toString()}`
    );
    return response.data;
  }

  async getOpportunityRequest(id: string): Promise<OpportunityRequestResponse> {
    const response = await apiService.get(
      `opportunity-requests/${id}`
    );
    return response.data;
  }

  async updateOpportunityRequest(id: string, data: { status: string; admin_notes?: string }): Promise<OpportunityRequestResponse> {
    const response = await apiService.put(
      `opportunity-requests/${id}`,
      data
    );
    return response.data;
  }

  // Add more methods as needed, like create, update, delete
}

export default new OpportunityRequestService();
