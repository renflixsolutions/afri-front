import apiService from './ApiService';
import { JobsResponse, JobResponse, Job } from '@/types/jobs';

class JobService {
  async getJobs(options?: { page?: number; search?: string; job_type?: string; category?: string; level?: string; }): Promise<JobsResponse> {
    const query = new URLSearchParams();
    const page = options?.page ?? 1;
    query.set('page', String(page));
    if (options) {
      if (options.search) query.set('search', options.search);
      if (options.job_type) query.set('job_type', options.job_type);
      if (options.category) query.set('category', options.category);
      if (options.level) query.set('level', options.level);
    }

    const response = await apiService.get(
      `jobs?${query.toString()}`
    );
    return response.data;
  }

  async createJob(data: Partial<Job>): Promise<JobResponse> {
    const response = await apiService.post(
      `jobs`,
      data
    );
    return response.data;
  }

  async getJob(jobId: string): Promise<JobResponse> {
    const response = await apiService.get(
      `jobs/${jobId}`
    );
    return response.data;
  }

  async updateJob(jobId: string, data: Partial<Job>): Promise<JobResponse> {
    const response = await apiService.put(
      `jobs/${jobId}`,
      data
    );
    return response.data;
  }

  async deleteJob(jobId: string): Promise<{ status: boolean; message: string }> {
    const response = await apiService.delete(
      `jobs/${jobId}`
    );
    return response.data;
  }
}

export default new JobService();
