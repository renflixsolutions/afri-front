import apiService from './ApiService';
import {
  JobApplicationsResponse,
  UpdateApplicationStatusRequest,
  UpdateApplicationStatusResponse
} from '@/types/jobs';

class JobApplicationServiceClass {
  async getApplications(
    page: number = 1,
    status?: string,
    jobId?: string
  ): Promise<JobApplicationsResponse> {
    let url = `job-applications?page=${page}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (jobId) url += `&job_id=${encodeURIComponent(jobId)}`;

    const response = await apiService.get(url);
    return response.data;
  }

  async updateApplicationStatus(
    data: UpdateApplicationStatusRequest
  ): Promise<UpdateApplicationStatusResponse> {
    const response = await apiService.patch('job-applications/status', data);
    return response.data;
  }
}

const JobApplicationService = new JobApplicationServiceClass();
export default JobApplicationService;

