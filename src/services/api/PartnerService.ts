import apiService from './ApiService';
import { PartnersResponse, PartnerResponse } from '@/types/partners';

class PartnerService {
  async getPartners(page: number = 1, search?: string): Promise<PartnersResponse> {
    let url = `partners?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await apiService.get(url);
    return response.data;
  }

  async getPartner(partnerId: string): Promise<PartnerResponse> {
    const response = await apiService.get(
      `partners/${partnerId}`
    );
    return response.data;
  }

  async createPartner(data: FormData): Promise<PartnerResponse> {
    const response = await apiService.post(
      `partners`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async updatePartner(partnerId: string, data: FormData): Promise<PartnerResponse> {

    const response = await apiService.post(
      `partners/${partnerId}`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async deletePartner(partnerId: string): Promise<{ status: boolean; message: string }> {
    const response = await apiService.delete(
      `partners/${partnerId}`
    );
    return response.data;
  }
}

export default new PartnerService();
