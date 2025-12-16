// filepath: c:\Users\omond\WebstormProjects\afri-front\src\services\api\CourseFeeService.ts
import apiService from './ApiService';
import {
  CourseFeesResponse,
  CourseFeesStatisticsResponse,
  CourseFeeFilters,
} from '@/types/course-fees';

class CourseFeeServiceClass {
  // Get all course fee payments with filters
  async getCourseFees(page: number = 1, filters?: CourseFeeFilters): Promise<CourseFeesResponse> {
    const params = new URLSearchParams({ page: page.toString() });

    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.is_eligible !== undefined) params.append('is_eligible', filters.is_eligible.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await apiService.get<CourseFeesResponse['data']>(`course-fees?${params.toString()}`);
    return response.data;
  }

  // Get course fee statistics
  async getCourseFeeStatistics(): Promise<CourseFeesStatisticsResponse> {
    const response = await apiService.get<CourseFeesStatisticsResponse['data']>('course-fees/statistics');
    return response.data;
  }
}

const CourseFeeService = new CourseFeeServiceClass();
export default CourseFeeService;

