// filepath: c:\Users\omond\WebstormProjects\afri-front\src\services\api\CourseTimetableService.ts
import apiService from './ApiService';
import {
  CourseTimetable,
  CourseTimetablesResponse,
  CourseTimetableResponse,
  CreateTimetablePayload,
  UpdateLevelConfigsPayload,
  UpdateTracksPayload,
  GenerateOfferingsPayload,
  GenerateOfferingsResponse,
} from '@/types/course-timetables';

class CourseTimetableServiceClass {
  // Get all timetables
  async getTimetables(): Promise<CourseTimetablesResponse> {
    const response = await apiService.get<CourseTimetable[]>('course-timetables');
    return response.data;
  }

  // Get single timetable
  async getTimetable(id: number | string): Promise<CourseTimetableResponse> {
    const response = await apiService.get<CourseTimetable>(`course-timetables/${id}`);
    return response.data;
  }

  // Get active timetable
  async getActiveTimetable(): Promise<CourseTimetableResponse> {
    const response = await apiService.get<CourseTimetable>('course-timetables/active');
    return response.data;
  }

  // Create timetable
  async createTimetable(data: CreateTimetablePayload): Promise<CourseTimetableResponse> {
    const response = await apiService.post<CourseTimetable>('course-timetables', data);
    return response.data;
  }

  // Update timetable
  async updateTimetable(id: number | string, data: Partial<CreateTimetablePayload>): Promise<CourseTimetableResponse> {
    const response = await apiService.put<CourseTimetable>(`course-timetables/${id}`, data);
    return response.data;
  }

  // Delete timetable
  async deleteTimetable(id: number | string): Promise<{ status: string; message: string }> {
    const response = await apiService.delete<{ status: string; message: string }>(`course-timetables/${id}`);
    return response.data;
  }

  // Update level configurations
  async updateLevelConfigs(id: number | string, data: UpdateLevelConfigsPayload): Promise<CourseTimetableResponse> {
    const response = await apiService.post<CourseTimetable>(`course-timetables/${id}/level-configs`, data);
    return response.data;
  }

  // Update tracks
  async updateTracks(id: number | string, data: UpdateTracksPayload): Promise<CourseTimetableResponse> {
    const response = await apiService.post<CourseTimetable>(`course-timetables/${id}/tracks`, data);
    return response.data;
  }

  // Generate course offerings
  async generateOfferings(id: number | string, data: GenerateOfferingsPayload): Promise<GenerateOfferingsResponse> {
    const response = await apiService.post<GenerateOfferingsResponse['data']>(`course-timetables/${id}/generate-offerings`, data);
    return response.data;
  }
}

const CourseTimetableService = new CourseTimetableServiceClass();
export default CourseTimetableService;

