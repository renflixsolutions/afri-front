import apiService from './ApiService';
import {
  ScholarshipApplicationsResponse,
  ScholarshipApplicationResponse,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  AddDocumentResponse,
} from '@/types/scholarships';

class ScholarshipApplicationServiceClass {
  async getApplications(
    page: number = 1,
    filters?: {
      status?: string;
      user_id?: number;
      opportunity_id?: number;
    }
  ): Promise<ScholarshipApplicationsResponse> {
    let url = `scholarship-applications?page=${page}`;

    if (filters?.status) url += `&status=${encodeURIComponent(filters.status)}`;
    if (filters?.user_id) url += `&user_id=${filters.user_id}`;
    if (filters?.opportunity_id) url += `&opportunity_id=${filters.opportunity_id}`;

    const response = await apiService.get(url);
    return response.data;
  }

  async getApplication(id: number): Promise<ScholarshipApplicationResponse> {
    const response = await apiService.get(`scholarship-applications/${id}`);
    return response.data;
  }

  async createApplication(data: CreateApplicationRequest, documents?: Array<{ document_type: string; file: File }>): Promise<ScholarshipApplicationResponse> {
    const formData = new FormData();

    // Add text fields
    if (data.user_id) formData.append('user_id', data.user_id.toString());
    formData.append('opportunity_id', data.opportunity_id);
    if (data.partner_id) formData.append('partner_id', data.partner_id.toString());
    if (data.application_ref) formData.append('application_ref', data.application_ref);
    formData.append('full_name', data.full_name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    if (data.motivation) formData.append('motivation', data.motivation);
    if (data.status) formData.append('status', data.status);
    if (data.submitted_at) formData.append('submitted_at', data.submitted_at);

    // Add documents
    if (documents && documents.length > 0) {
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][document_type]`, doc.document_type);
        formData.append(`documents[${index}][file]`, doc.file);
      });
    }

    const response = await apiService.post('scholarship-applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateApplication(id: number, data: UpdateApplicationRequest): Promise<ScholarshipApplicationResponse> {
    const response = await apiService.put(`scholarship-applications/${id}`, data);
    return response.data;
  }

  async deleteApplication(id: number): Promise<{ status: boolean; message: string }> {
    const response = await apiService.delete(`scholarship-applications/${id}`);
    return response.data;
  }

  async addDocument(applicationId: number, documentType: string, file: File): Promise<AddDocumentResponse> {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);

    const response = await apiService.post(`scholarship-applications/${applicationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

const ScholarshipApplicationService = new ScholarshipApplicationServiceClass();
export default ScholarshipApplicationService;

