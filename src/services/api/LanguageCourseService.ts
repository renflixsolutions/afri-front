import apiService from './ApiService';
import { LanguageCoursesResponse, LanguageCourseResponse, LanguageCourse } from '@/types/language-courses';

class LanguageCourseServiceClass {
  async getCourses(page: number = 1, search?: string): Promise<LanguageCoursesResponse> {
    let url = `language-courses?page=${page}`;
    if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
    const response = await apiService.get(url);
    return response.data;
  }

  async getCourse(courseId: number | string): Promise<LanguageCourseResponse> {
    const response = await apiService.get(`language-courses/${courseId}`);
    return response.data;
  }

  async createCourse(data: Partial<LanguageCourse>): Promise<LanguageCourseResponse> {
    const response = await apiService.post(`language-courses`, data);
    return response.data;
  }

  async updateCourse(courseId: number | string, data: Partial<LanguageCourse>): Promise<LanguageCourseResponse> {
    const response = await apiService.put(`language-courses/${courseId}`, data);
    return response.data;
  }

  async deleteCourse(courseId: number | string): Promise<{ status: boolean; message: string }> {
    const response = await apiService.delete(`language-courses/${courseId}`);
    return response.data;
  }
}

const LanguageCourseService = new LanguageCourseServiceClass();
export default LanguageCourseService;

