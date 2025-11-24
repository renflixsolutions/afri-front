import apiService from './ApiService';
import { CreateUserData } from '@/types/users';
import { PaginatedResponse } from '@/types/regions';
import type { User, AuditTrail } from '@/types/users';

interface Role {
  id: string;
  name: string;
}

interface RolesResponse {
  status: boolean;
  message: string;
  data: Role[];
}

export class UserService {
  public async listUsers(page: number = 1): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<PaginatedResponse<User>>(`users/list?page=${page}`);
    
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load users');
    }
  }

  public async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiService.post('users/add', userData);

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create user');
    }
  }

  public async getRoles(): Promise<RolesResponse> {
    const response = await apiService.get<RolesResponse>('user-roles');
    return response.data.data;
  }

  public async resetPassword(userId: string): Promise<{ status: boolean; message: string }> {
    const response = await apiService.post(`users/reset-password/${userId}`);

    if (response.data.status) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to reset password');
    }
  }

  public async updateUserStatus(userId: string, action: 'lock' | 'unlock' | 'activate' | 'deactivate'): Promise<User> {
    const response = await apiService.post(`users/user-status/${userId}`, { action });

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update user status');
    }
  }

  public async getUserAuditTrails(userId: string, page: number = 1): Promise<PaginatedResponse<AuditTrail>> {
    const response = await apiService.get<PaginatedResponse<AuditTrail>>(`users/audit-trails/${userId}?page=${page}`);

    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load audit trails');
    }
  }

  public async updateUser(userId: string, userData: Partial<CreateUserData>): Promise<User> {
    const response = await apiService.put(`users/update/${userId}`, userData);

    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update user');
    }
  }
}

export const userService = new UserService();
