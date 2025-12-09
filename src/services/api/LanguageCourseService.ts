import apiService from './ApiService';
import { LanguageCoursesResponse, LanguageCourseResponse, LanguageCourse, EnrollmentsResponse, LanguageCoursesPaginationData, EnrollmentsPaginationData } from '@/types/language-courses';

class LanguageCourseServiceClass {
  async getCourses(page: number = 1, search?: string): Promise<LanguageCoursesResponse> {
    let url = `language-courses?page=${page}`;
    if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
    const response = await apiService.get<LanguageCoursesPaginationData>(url);
    return response.data;
  }

  async getCourse(courseId: number | string): Promise<LanguageCourseResponse> {
    const response = await apiService.get<LanguageCourse>(`language-courses/${courseId}`);
    return response.data;
  }

  async createCourse(data: Partial<LanguageCourse>): Promise<LanguageCourseResponse> {
    const response = await apiService.post<LanguageCourse>(`language-courses`, data);
    return response.data;
  }

  async updateCourse(courseId: number | string, data: Partial<LanguageCourse>): Promise<LanguageCourseResponse> {
    const response = await apiService.put<LanguageCourse>(`language-courses/${courseId}`, data);
    return response.data;
  }

  async deleteCourse(courseId: number | string): Promise<{ status: boolean; message: string }> {
    const response = await apiService.delete<{ status: boolean; message: string }>(`language-courses/${courseId}`);
    return response.data;
  }

  async getEnrollments(page: number = 1, search?: string): Promise<EnrollmentsResponse> {
    let url = `/enrollments?page=${page}`;
    if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
    const response = await apiService.get<EnrollmentsPaginationData>(url);
    return response.data;
  }
}

const LanguageCourseService = new LanguageCourseServiceClass();
export default LanguageCourseService;
