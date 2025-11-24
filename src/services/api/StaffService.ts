import apiService from './ApiService';
import { PaginatedResponse } from '@/types/regions';
import type { Staff, StaffAuditTrail } from '@/types/staff';

interface CreateStaffData {
  full_name: string;
  username: string;
  email?: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  country_id: string;
  location_id: string;
  sub_location_id: string;
  role_id: string;
}

interface UpdateStaffData {
  full_name: string;
  email: string;
  phone?: string;
  country_id: string;
  location_id: string;
  sub_location_id: string;
  role_id: string;
}

export class StaffService {
  public async listStaff(page: number = 1): Promise<PaginatedResponse<Staff>> {
    const response = await apiService.get<PaginatedResponse<Staff>>(`staff/list?page=${page}`);
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load staff');
    }
  }

  public async listStaffRoles(): Promise<{ id: string; name: string }[]> {
    const response = await apiService.get('staff-roles');

    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load staff roles');
    }
  }

  public async createStaff(staffData: CreateStaffData): Promise<Staff> {
    const response = await apiService.post('staff/add', staffData);

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create staff');
    }
  }

  public async updateStaff(staffId: string, staffData: UpdateStaffData): Promise<Staff> {
    const response = await apiService.put(`staff/${staffId}`, staffData);

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update staff');
    }
  }

  public async updateStaffStatus(staffId: string, action: 'lock' | 'unlock' | 'activate' | 'deactivate'): Promise<Staff> {
    const response = await apiService.post(`staff/staff-status/${staffId}`, { action });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update staff status');
    }
  }

  public async resetStaffPassword(staffId: string): Promise<{ message: string }> {
    const response = await apiService.post(`staff/reset-password/${staffId}`, {});

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to reset password');
    }
  }

  public async getStaffAuditTrails(staffId: string, page: number = 1): Promise<PaginatedResponse<StaffAuditTrail>> {
    const response = await apiService.get(`staff/audit-trails/${staffId}?page=${page}`);

    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load staff audit trails');
    }
  }
}

export const staffService = new StaffService();
