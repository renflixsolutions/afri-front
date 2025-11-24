import apiService from './ApiService';
import {
  ScholarshipsResponse,
  ScholarshipResponse,
  CreateScholarshipRequest,
  UpdateScholarshipRequest,
  FundingType,
} from '@/types/scholarships';

class ScholarshipServiceClass {
  async getScholarships(
    page: number = 1,
    filters?: {
      country?: string;
      level?: string;
      is_fully_funded?: boolean;
      partner_id?: string;
      search?: string;
      sort?: string;
      order?: string;
      funding_type?: FundingType;
    }
  ): Promise<ScholarshipsResponse> {
    let url = `scholarships?page=${page}`;

    if (filters?.country) url += `&country=${encodeURIComponent(filters.country)}`;
    if (filters?.level) url += `&level=${encodeURIComponent(filters.level)}`;
    if (filters?.is_fully_funded !== undefined) url += `&is_fully_funded=${filters.is_fully_funded}`;
    if (filters?.funding_type) url += `&funding_type=${encodeURIComponent(filters.funding_type)}`;
    if (filters?.partner_id) url += `&partner_id=${encodeURIComponent(filters.partner_id)}`;
    if (filters?.search) url += `&search=${encodeURIComponent(filters.search)}`;
    if (filters?.sort) url += `&sort=${filters.sort}`;
    if (filters?.order) url += `&order=${filters.order}`;

    const response = await apiService.get(url);
    return response.data;
  }

  async getScholarship(id: string): Promise<ScholarshipResponse> {
    const response = await apiService.get(`scholarships/${id}`);
    return response.data;
  }

  async createScholarship(data: CreateScholarshipRequest): Promise<ScholarshipResponse> {
    const response = await apiService.post('scholarships', data);
    return response.data;
  }

  async updateScholarship(id: string, data: UpdateScholarshipRequest): Promise<ScholarshipResponse> {
    const response = await apiService.put(`scholarships/${id}`, data);
    return response.data;
  }

  async deleteScholarship(id: string): Promise<{ status: boolean; message: string }> {
    const response = await apiService.delete(`scholarships/${id}`);
    return response.data;
  }
}

const ScholarshipService = new ScholarshipServiceClass();
export default ScholarshipService;
